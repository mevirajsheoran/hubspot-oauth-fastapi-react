/**
 * HubSpot Integration Component
 * ============================
 *
 * This component handles OAuth2 integration with HubSpot CRM API.
 * Provides access to contacts, companies, and deals data.
 */

import { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Button,
    CircularProgress,
    Typography,
    Alert,
    Snackbar,
    Tooltip,
    Chip
} from '@mui/material';
import axios from 'axios';

// OAuth window configuration
const OAUTH_CONFIG = {
    width: 600,
    height: 700,
    left: (window.screen.width - 600) / 2,
    top: (window.screen.height - 700) / 2
};

const POLL_INTERVAL = 200;

export const HubSpotIntegration = ({ user, org, integrationParams, setIntegrationParams }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState(null);
    const [showError, setShowError] = useState(false);
    const [scopes, setScopes] = useState([]);

    /**
     * Opens centered OAuth authorization window
     */
    const openAuthWindow = useCallback((authUrl) => {
        const features = [
            `width=${OAUTH_CONFIG.width}`,
            `height=${OAUTH_CONFIG.height}`,
            `left=${OAUTH_CONFIG.left}`,
            `top=${OAUTH_CONFIG.top}`,
            'resizable=yes',
            'scrollbars=yes',
            'status=yes'
        ].join(',');

        return window.open(authUrl, 'HubSpot Authorization', features);
    }, []);

    /**
     * Initiates HubSpot OAuth connection
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

            const formData = new FormData();
            formData.append('user_id', user);
            formData.append('org_id', org);

            const response = await axios.post(
                'http://localhost:8000/integrations/hubspot/authorize',
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
            console.error('HubSpot connection error:', error);
        }
    }, [user, org, openAuthWindow]);

    /**
     * Handles OAuth callback after window closes
     */
    const handleWindowClosed = useCallback(async () => {
        try {
            const formData = new FormData();
            formData.append('user_id', user);
            formData.append('org_id', org);

            const response = await axios.post(
                'http://localhost:8000/integrations/hubspot/credentials',
                formData,
                { timeout: 10000 }
            );

            const credentials = response.data;
            if (credentials && credentials.access_token) {
                setIsConnected(true);
                if (credentials.scope) {
                    setScopes(credentials.scope.split(' '));
                }
                setIntegrationParams(prev => ({
                    ...prev,
                    credentials: credentials,
                    type: 'HubSpot'
                }));
            } else {
                throw new Error('Invalid credentials received');
            }
        } catch (error) {
            const errorMessage = error?.response?.data?.detail || error.message || 'Failed to retrieve credentials';
            setError(errorMessage);
            setShowError(true);
            console.error('HubSpot credentials error:', error);
        } finally {
            setIsConnecting(false);
        }
    }, [user, org, setIntegrationParams]);

    const handleErrorClose = useCallback(() => {
        setShowError(false);
        setError(null);
    }, []);

    useEffect(() => {
        const hasCredentials = integrationParams?.credentials && integrationParams.type === 'HubSpot';
        setIsConnected(hasCredentials);
        if (hasCredentials && integrationParams.credentials?.scope) {
            setScopes(integrationParams.credentials.scope.split(' '));
        }
    }, [integrationParams]);

    return (
        <>
            <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                    HubSpot Integration
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Connect to HubSpot CRM to access contacts, companies, and deals
                </Typography>

                {scopes.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                            Granted Permissions:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                            {scopes.map((scope, index) => (
                                <Chip
                                    key={index}
                                    label={scope.replace('crm.objects.', '').replace('.read', '')}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                />
                            ))}
                        </Box>
                    </Box>
                )}

                <Box display='flex' alignItems='center' justifyContent='center' sx={{ mt: 2 }}>
                    <Tooltip title={isConnected ? 'Connected to HubSpot CRM' : 'Connect to HubSpot'}>
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
                                '✓ HubSpot Connected'
                            ) : isConnecting ? (
                                <>
                                    <CircularProgress size={20} sx={{ mr: 1 }} />
                                    Connecting...
                                </>
                            ) : (
                                'Connect to HubSpot'
                            )}
                        </Button>
                    </Tooltip>
                </Box>
            </Box>

            <Snackbar
                open={showError}
                autoHideDuration={6000}
                onClose={handleErrorClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleErrorClose} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </>
    );
};
