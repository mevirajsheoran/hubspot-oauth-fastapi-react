import { useState } from 'react';
import {
    Box,
    TextField,
    Button,
} from '@mui/material';
import axios from 'axios';

/**
 * Mapping of integration display names to API endpoint names
 * @type {Object.<string, string>}
 */
const endpointMapping = {
    'Notion': 'notion',
    'Airtable': 'airtable',
    'HubSpot': 'hubspot',
};

/**
 * Data Form Component
 * 
 * Component for loading and displaying data from various integrations.
 * Provides functionality to fetch data from the backend and display it.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.integrationType - The type of integration (Notion, Airtable, HubSpot)
 * @param {Object} props.credentials - OAuth credentials for the integration
 * @returns {JSX.Element} Data loading form component
 */
export const DataForm = ({ integrationType, credentials }) => {
    const [loadedData, setLoadedData] = useState(null);
    const [loading, setLoading] = useState(false);
    const endpoint = endpointMapping[integrationType];

    /**
     * Handles loading data from the integration API
     * Fetches data using the provided credentials and displays it
     */
    const handleLoad = async () => {
        if (!credentials) {
            alert('No credentials available. Please authorize the integration first.');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('credentials', JSON.stringify(credentials));
            const response = await axios.post(`http://localhost:8000/integrations/${endpoint}/load`, formData);
            const data = response.data;
            setLoadedData(JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Error loading data:', error);
            const errorMessage = error?.response?.data?.detail || 'Failed to load data. Please try again.';
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Box display='flex' justifyContent='center' alignItems='center' flexDirection='column' width='100%'>
            <Box display='flex' flexDirection='column' width='100%'>
                <TextField
                    label="Loaded Data"
                    value={loadedData || ''}
                    sx={{ mt: 2 }}
                    InputLabelProps={{ shrink: true }}
                    disabled
                />
                <Button
                    onClick={handleLoad}
                    disabled={loading}
                    sx={{ mt: 2 }}
                    variant='contained'
                    color='primary'
                >
                    {loading ? 'Loading...' : 'Load Data'}
                </Button>
                <Button
                    onClick={() => setLoadedData(null)}
                    sx={{ mt: 1 }}
                    variant='outlined'
                    color='secondary'
                >
                    Clear Data
                </Button>
            </Box>
        </Box>
    );
}
