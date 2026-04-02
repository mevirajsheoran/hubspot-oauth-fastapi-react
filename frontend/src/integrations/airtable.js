/**
 * Airtable Integration Component
 * ==========================
 * 
 * This component handles OAuth2 integration with Airtable API.
 * It provides authorization flow, connection status management, and credential handling.
 */

import { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Button,
    CircularProgress,
    Typography,
    Alert,
    Snackbar
} from '@mui/material';
import axios from 'axios';

// Constants
const OAUTH_WINDOW_CONFIG = {
    width: 600,
    height: 600,
    left: (window.screen.width - 600) / 2,
    top: (window.screen.height - 600) / 2
};

const POLL_INTERVAL = 200; // milliseconds

export const AirtableIntegration = ({ user, org, integrationParams, setIntegrationParams }) => {
    // State management
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState(null);
    const [showError, setShowError] = useState(false);

    /**
     * Open OAuth authorization window with centered positioning
     */
    const openAuthWindow = useCallback((authUrl) => {
        const features = [
            `width=${OAUTH_WINDOW_CONFIG.width}`,
            `height=${OAUTH_WINDOW_CONFIG.height}`,
            `left=${OAUTH_WINDOW_CONFIG.left}`,
            `top=${OAUTH_WINDOW_CONFIG.top}`,
            'resizable=yes',
            'scrollbars=yes',
            'status=yes'
        ].join(',');

        return window.open(authUrl, 'Airtable Authorization', features);
    }, []);

    /**
     * Handle OAuth connection initiation
     */
    const handleConnectClick = useCallback(async () => {
        if (!user || !org) {
            setError('User ID and Organization ID are required');
            setShowError(true);
            return;
        }

        try {
            setIsConnecting(true);
            setError(null);
            setShowError(false);

            const formData = new FormData();
            formData.append('user_id', user);
            formData.append('org_id', org);

            const response = await axios.post(
                'http://localhost:8000/integrations/airtable/authorize',
                formData,
                { timeout: 10000 }
            );

            const authURL = response?.data;
            if (!authURL) {
                throw new Error('Authorization URL not received');
            }

            const newWindow = openAuthWindow(authURL);
            if (!newWindow) {
                throw new Error('Popup blocked. Please allow popups for this site.');
            }

            // Poll for window closure
            const pollTimer = window.setInterval(() => {
                if (newWindow?.closed !== false) {
                    window.clearInterval(pollTimer);
                    handleWindowClosed();
                }
            }, POLL_INTERVAL);

        } catch (error) {
            setIsConnecting(false);
            const errorMessage = error?.response?.data?.detail || error.message || 'Connection failed';
            setError(errorMessage);
            setShowError(true);
            console.error('Airtable connection error:', error);
        }
    }, [user, org, openAuthWindow]);

    /**
     * Handle OAuth callback after window closes
     */
    const handleWindowClosed = useCallback(async () => {
        try {
            const formData = new FormData();
            formData.append('user_id', user);
            formData.append('org_id', org);

            const response = await axios.post(
                'http://localhost:8000/integrations/airtable/credentials',
                formData,
                { timeout: 10000 }
            );

            const credentials = response.data;
            if (credentials && credentials.access_token) {
                setIsConnected(true);
                setIntegrationParams(prev => ({
                    ...prev,
                    credentials: credentials,
                    type: 'Airtable'
                }));
            } else {
                throw new Error('Invalid credentials received');
            }
        } catch (error) {
            const errorMessage = error?.response?.data?.detail || error.message || 'Failed to retrieve credentials';
            setError(errorMessage);
            setShowError(true);
            console.error('Airtable credentials error:', error);
        } finally {
            setIsConnecting(false);
        }
    }, [user, org, setIntegrationParams]);

    /**
     * Handle error snackbar close
     */
    const handleErrorClose = useCallback(() => {
        setShowError(false);
        setError(null);
    }, []);

    /**
     * Initialize connection state from props
     */
    useEffect(() => {
        const hasCredentials = integrationParams?.credentials && integrationParams.type === 'Airtable';
        setIsConnected(hasCredentials);
    }, [integrationParams]);

    return (
        <>
            <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Airtable Integration
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Connect your Airtable account to access your bases and tables
                </Typography>

                <Box display='flex' alignItems='center' justifyContent='center' sx={{ mt: 2 }}>
                    <Button
                        variant='contained'
                        onClick={isConnected ? undefined : handleConnectClick}
                        color={isConnected ? 'success' : 'primary'}
                        disabled={isConnecting}
                        size='large'
                        sx={{
                            minWidth: 200,
                            textTransform: 'none',
                            fontWeight: 'bold'
                        }}
                    >
                        {isConnected ? (
                            '✓ Airtable Connected'
                        ) : isConnecting ? (
                            <>
                                <CircularProgress size={20} sx={{ mr: 1 }} />
                                Connecting...
                            </>
                        ) : (
                            'Connect to Airtable'
                        )}
                    </Button>
                </Box>
            </Box>

            <Snackbar
                open={showError}
                autoHideDuration={6000}
                onClose={handleErrorClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleErrorClose}
                    severity="error"
                    sx={{ width: '100%' }}
                >
                    {error}
                </Alert>
            </Snackbar>
        </>
    );
};
