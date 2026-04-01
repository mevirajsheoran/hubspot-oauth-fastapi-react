import { useState } from 'react';
import {
    Box,
    Autocomplete,
    TextField,
    Typography,
} from '@mui/material';
import { AirtableIntegration } from './integrations/airtable';
import { NotionIntegration } from './integrations/notion';
import { HubSpotIntegration } from './integrations/hubspot';
import { DataForm } from './data-form';

/**
 * Mapping of integration names to their respective components
 * @type {Object.<string, React.Component>}
 */
const integrationMapping = {
    'Notion': NotionIntegration,
    'Airtable': AirtableIntegration,
    'HubSpot': HubSpotIntegration,
};

/**
 * Integration Form Component
 * 
 * Main form component for managing OAuth2 integrations.
 * Allows users to select integration types, configure user/org details,
 * and handle authorization flows.
 * 
 * @component
 * @returns {JSX.Element} Integration form component
 */
export const IntegrationForm = () => {
    const [integrationParams, setIntegrationParams] = useState({});
    const [user, setUser] = useState('TestUser');
    const [org, setOrg] = useState('TestOrg');
    const [currType, setCurrType] = useState(null);
    const CurrIntegration = integrationMapping[currType];

    return (
        <Box display='flex' justifyContent='center' alignItems='center' flexDirection='column' sx={{ width: '100%', p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Pipeline AI Integration Manager
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Configure and manage your OAuth2 integrations
            </Typography>

            <Box display='flex' flexDirection='column' sx={{ width: '100%', maxWidth: 400 }}>
                <TextField
                    label="User ID"
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                    sx={{ mt: 2 }}
                    helperText="Enter your user identifier"
                />
                <TextField
                    label="Organization ID"
                    value={org}
                    onChange={(e) => setOrg(e.target.value)}
                    sx={{ mt: 2 }}
                    helperText="Enter your organization identifier"
                />
                <Autocomplete
                    id="integration-type"
                    options={Object.keys(integrationMapping)}
                    sx={{ width: '100%', mt: 2 }}
                    renderInput={(params) => <TextField {...params} label="Integration Type" helperText="Select an integration to configure" />}
                    onChange={(e, value) => setCurrType(value)}
                    value={currType}
                />
            </Box>
            {currType &&
                <Box>
                    <CurrIntegration user={user} org={org} integrationParams={integrationParams} setIntegrationParams={setIntegrationParams} />
                </Box>
            }
            {integrationParams?.credentials &&
                <Box sx={{ mt: 2 }}>
                    <DataForm integrationType={integrationParams?.type} credentials={integrationParams?.credentials} />
                </Box>
            }
        </Box>
    );
}
