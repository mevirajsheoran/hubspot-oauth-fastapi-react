# API Documentation
# ================

This document provides comprehensive API documentation for the Pipeline AI Integration Manager backend service.

## Base URL

```
Development: http://localhost:8000
Production: https://your-domain.com
```

## Authentication

This service uses OAuth2 for authentication with external platforms. No direct API authentication is required.

## Endpoints

### Health Check

#### GET /
Health check endpoint to verify service status.

**Response:**
```json
{
  "Ping": "Pong"
}
```

---

## Airtable Integration

### Authorize Integration

#### POST /integrations/airtable/authorize
Initiates OAuth2 authorization flow with Airtable.

**Request Body:**
- `user_id` (string, required): User identifier
- `org_id` (string, required): Organization identifier

**Response:**
- `200`: Authorization URL string
- `400`: Error details

**Example:**
```bash
curl -X POST "http://localhost:8000/integrations/airtable/authorize" \
  -F "user_id=testuser" \
  -F "org_id=testorg"
```

### OAuth Callback

#### GET /integrations/airtable/oauth2callback
Handles OAuth2 callback from Airtable.

**Query Parameters:**
- `code` (string): Authorization code
- `state` (string): Base64-encoded state data

**Response:**
- `200`: HTML page that closes the popup
- `400`: Error details

### Retrieve Credentials

#### POST /integrations/airtable/credentials
Retrieves stored OAuth credentials after successful authorization.

**Request Body:**
- `user_id` (string, required): User identifier
- `org_id` (string, required): Organization identifier

**Response:**
```json
{
  "access_token": "string",
  "refresh_token": "string",
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

### Load Data

#### POST /integrations/airtable/load
Loads data from Airtable using stored credentials.

**Request Body:**
- `credentials` (string, required): JSON string of OAuth credentials

**Response:**
```json
[
  {
    "id": "app123_Base",
    "name": "My Base",
    "type": "Base",
    "parent_id": null,
    "parent_path_or_name": null
  },
  {
    "id": "tbl456_Table",
    "name": "My Table",
    "type": "Table",
    "parent_id": "app123_Base",
    "parent_path_or_name": "My Base"
  }
]
```

---

## Notion Integration

### Authorize Integration

#### POST /integrations/notion/authorize
Initiates OAuth2 authorization flow with Notion.

**Request Body:**
- `user_id` (string, required): User identifier
- `org_id` (string, required): Organization identifier

**Response:**
- `200`: Authorization URL string
- `400`: Error details

### OAuth Callback

#### GET /integrations/notion/oauth2callback
Handles OAuth2 callback from Notion.

**Query Parameters:**
- `code` (string): Authorization code
- `state` (string): JSON-encoded state data

**Response:**
- `200`: HTML page that closes the popup
- `400`: Error details

### Retrieve Credentials

#### POST /integrations/notion/credentials
Retrieves stored OAuth credentials after successful authorization.

**Request Body:**
- `user_id` (string, required): User identifier
- `org_id` (string, required): Organization identifier

**Response:**
```json
{
  "access_token": "string",
  "bot_id": "string",
  "workspace_name": "string",
  "workspace_icon": "string",
  "workspace_id": "string",
  "owner": {
    "type": "string",
    "user": {
      "id": "string",
      "object": "user"
    }
  },
  "duplicated_template_id": null
}
```

### Load Data

#### POST /integrations/notion/load
Loads data from Notion using stored credentials.

**Request Body:**
- `credentials` (string, required): JSON string of OAuth credentials

**Response:**
```json
[
  {
    "id": "page123",
    "name": "page My Page",
    "type": "page",
    "creation_time": "2026-04-01T10:00:00.000Z",
    "last_modified_time": "2026-04-01T11:00:00.000Z",
    "parent_id": "parent123",
    "parent_path_or_name": "Parent Page"
  }
]
```

---

## HubSpot Integration

### Authorize Integration

#### POST /integrations/hubspot/authorize
Initiates OAuth2 authorization flow with HubSpot.

**Request Body:**
- `user_id` (string, required): User identifier
- `org_id` (string, required): Organization identifier

**Response:**
- `200`: Authorization URL string
- `400`: Error details

### OAuth Callback

#### GET /integrations/hubspot/oauth2callback
Handles OAuth2 callback from HubSpot.

**Query Parameters:**
- `code` (string): Authorization code
- `state` (string): JSON-encoded state data

**Response:**
- `200`: HTML page that closes the popup
- `400`: Error details

### Retrieve Credentials

#### POST /integrations/hubspot/credentials
Retrieves stored OAuth credentials after successful authorization.

**Request Body:**
- `user_id` (string, required): User identifier
- `org_id` (string, required): Organization identifier

**Response:**
```json
{
  "access_token": "string",
  "refresh_token": "string",
  "expires_in": 3600,
  "token_type": "Bearer",
  "scope": "crm.objects.contacts.read crm.objects.companies.read crm.objects.deals.read"
}
```

### Load Data

#### POST /integrations/hubspot/load
Loads data from HubSpot using stored credentials.

**Request Body:**
- `credentials` (string, required): JSON string of OAuth credentials

**Response:**
```json
[
  {
    "id": "contact123_Contact",
    "name": "Contact: John Doe",
    "type": "Contact",
    "creation_time": "2026-04-01T10:00:00.000Z",
    "last_modified_time": "2026-04-01T11:00:00.000Z",
    "parent_id": null
  },
  {
    "id": "company123_Company",
    "name": "Company: Acme Corp",
    "type": "Company",
    "creation_time": "2026-04-01T10:00:00.000Z",
    "last_modified_time": "2026-04-01T11:00:00.000Z",
    "parent_id": null
  },
  {
    "id": "deal123_Deal",
    "name": "Deal: Partnership Opportunity",
    "type": "Deal",
    "creation_time": "2026-04-01T10:00:00.000Z",
    "last_modified_time": "2026-04-01T11:00:00.000Z",
    "parent_id": null
  }
]
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "detail": "Error message describing what went wrong"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error occurred"
}
```

## Rate Limiting

- **Redis Operations**: No explicit rate limiting
- **External APIs**: Subject to individual platform rate limits
- **Recommendation**: Implement exponential backoff for failed requests

## CORS Configuration

**Development:**
```javascript
origins: ["http://localhost:3000"]
methods: ["*"]
headers: ["*"]
credentials: true
```

**Production:**
- Configure specific allowed origins
- Restrict methods and headers as needed

## Data Models

### IntegrationItem
Standardized data structure for all platform items:

```typescript
interface IntegrationItem {
  id: string | null;
  type: string | null;
  name: string | null;
  directory: boolean;
  parent_path_or_name: string | null;
  parent_id: string | null;
  creation_time: string | null;
  last_modified_time: string | null;
  url: string | null;
  children: string[] | null;
  mime_type: string | null;
  delta: string | null;
  drive_id: string | null;
  visibility: boolean;
}
```

## SDK and Libraries

### Backend Dependencies
- **FastAPI**: Web framework
- **Redis**: Caching and session storage
- **Httpx**: Async HTTP client
- **Pydantic**: Data validation

### Frontend Dependencies
- **React**: UI framework
- **Material-UI**: Component library
- **Axios**: HTTP client

## Testing

### API Testing Examples

```bash
# Health check
curl http://localhost:8000/

# Airtable authorization
curl -X POST "http://localhost:8000/integrations/airtable/authorize" \
  -F "user_id=testuser" \
  -F "org_id=testorg"
```

## Support

For API support and questions:
- GitHub Issues: https://github.com/mevirajsheoran/hubspot-oauth-fastapi-react/issues
- Documentation: [README.md](./README.md)
- Security: [SECURITY.md](./SECURITY.md)
