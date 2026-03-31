# hubspot.py

import json
import secrets
from fastapi import Request, HTTPException
from fastapi.responses import HTMLResponse
import httpx
import asyncio
import requests
from integrations.integration_item import IntegrationItem

from redis_client import add_key_value_redis, get_value_redis, delete_key_redis

CLIENT_ID = 'YOUR_HUBSPOT_CLIENT_ID'
CLIENT_SECRET = 'YOUR_HUBSPOT_CLIENT_SECRET'

REDIRECT_URI = 'http://localhost:8000/integrations/hubspot/oauth2callback'
authorization_url = (
    f'https://app.hubspot.com/oauth/authorize'
    f'?client_id={CLIENT_ID}'
    f'&redirect_uri={REDIRECT_URI}'
    f'&scope=crm.objects.contacts.read%20crm.objects.companies.read%20crm.objects.deals.read'
)


async def authorize_hubspot(user_id, org_id):
    state_data = {
        'state': secrets.token_urlsafe(32),
        'user_id': user_id,
        'org_id': org_id
    }
    encoded_state = json.dumps(state_data)
    await add_key_value_redis(f'hubspot_state:{org_id}:{user_id}', encoded_state, expire=600)

    return f'{authorization_url}&state={encoded_state}'


async def oauth2callback_hubspot(request: Request):
    if request.query_params.get('error'):
        raise HTTPException(status_code=400, detail=request.query_params.get('error'))
    code = request.query_params.get('code')
    encoded_state = request.query_params.get('state')
    state_data = json.loads(encoded_state)

    original_state = state_data.get('state')
    user_id = state_data.get('user_id')
    org_id = state_data.get('org_id')

    saved_state = await get_value_redis(f'hubspot_state:{org_id}:{user_id}')

    if not saved_state or original_state != json.loads(saved_state).get('state'):
        raise HTTPException(status_code=400, detail='State does not match.')

    async with httpx.AsyncClient() as client:
        response, _ = await asyncio.gather(
            client.post(
                'https://api.hubapi.com/oauth/v1/token',
                data={
                    'grant_type': 'authorization_code',
                    'client_id': CLIENT_ID,
                    'client_secret': CLIENT_SECRET,
                    'redirect_uri': REDIRECT_URI,
                    'code': code,
                },
                headers={
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            ),
            delete_key_redis(f'hubspot_state:{org_id}:{user_id}'),
        )

    await add_key_value_redis(f'hubspot_credentials:{org_id}:{user_id}', json.dumps(response.json()), expire=600)

    close_window_script = """
    <html>
        <script>
            window.close();
        </script>
    </html>
    """
    return HTMLResponse(content=close_window_script)


async def get_hubspot_credentials(user_id, org_id):
    credentials = await get_value_redis(f'hubspot_credentials:{org_id}:{user_id}')
    if not credentials:
        raise HTTPException(status_code=400, detail='No credentials found.')
    credentials = json.loads(credentials)
    if not credentials:
        raise HTTPException(status_code=400, detail='No credentials found.')
    await delete_key_redis(f'hubspot_credentials:{org_id}:{user_id}')

    return credentials


def create_integration_item_metadata_object(
    response_json: dict, item_type: str,
) -> IntegrationItem:
    """Creates an IntegrationItem from a HubSpot CRM object response."""
    properties = response_json.get('properties', {})

    # Build a display name based on the object type
    if item_type == 'Contact':
        first = properties.get('firstname', '') or ''
        last = properties.get('lastname', '') or ''
        name = f'{first} {last}'.strip()
        if not name:
            name = properties.get('email', response_json.get('id', 'Unknown Contact'))
    elif item_type == 'Company':
        name = properties.get('name', '') or properties.get('domain', response_json.get('id', 'Unknown Company'))
    elif item_type == 'Deal':
        name = properties.get('dealname', '') or response_json.get('id', 'Unknown Deal')
    else:
        name = response_json.get('id', 'Unknown')

    integration_item_metadata = IntegrationItem(
        id=response_json.get('id', '') + '_' + item_type,
        type=item_type,
        name=f'{item_type}: {name}',
        creation_time=properties.get('createdate'),
        last_modified_time=properties.get('hs_lastmodifieddate'),
    )

    return integration_item_metadata


def _fetch_hubspot_objects(access_token: str, object_type: str, properties: list, aggregated: list):
    """Fetch all objects of a given type from HubSpot CRM with pagination."""
    url = f'https://api.hubapi.com/crm/v3/objects/{object_type}'
    headers = {'Authorization': f'Bearer {access_token}'}
    params = {
        'limit': 100,
        'properties': ','.join(properties),
    }

    while url:
        response = requests.get(url, headers=headers, params=params)
        if response.status_code != 200:
            print(f'Error fetching {object_type}: {response.status_code} {response.text}')
            break

        data = response.json()
        results = data.get('results', [])
        for item in results:
            aggregated.append(item)

        # Handle pagination
        paging = data.get('paging', {})
        next_page = paging.get('next', {})
        url = next_page.get('link', None)
        # Reset params for next page since the link includes them
        params = {} if url else params


async def get_items_hubspot(credentials) -> list[IntegrationItem]:
    """Aggregates all CRM metadata relevant for a HubSpot integration."""
    credentials = json.loads(credentials)
    access_token = credentials.get('access_token')

    list_of_integration_item_metadata = []

    # Fetch Contacts
    contacts = []
    _fetch_hubspot_objects(access_token, 'contacts', ['firstname', 'lastname', 'email'], contacts)
    for contact in contacts:
        list_of_integration_item_metadata.append(
            create_integration_item_metadata_object(contact, 'Contact')
        )

    # Fetch Companies
    companies = []
    _fetch_hubspot_objects(access_token, 'companies', ['name', 'domain'], companies)
    for company in companies:
        list_of_integration_item_metadata.append(
            create_integration_item_metadata_object(company, 'Company')
        )

    # Fetch Deals
    deals = []
    _fetch_hubspot_objects(access_token, 'deals', ['dealname', 'amount', 'dealstage'], deals)
    for deal in deals:
        list_of_integration_item_metadata.append(
            create_integration_item_metadata_object(deal, 'Deal')
        )

    print(f'list_of_integration_item_metadata: {list_of_integration_item_metadata}')
    return list_of_integration_item_metadata