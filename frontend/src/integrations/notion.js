/**
 * Notion Integration Component
 * ============================
 *
 * This component handles OAuth2 integration with Notion API.
 * Provides seamless workspace access and page/database management.
 */

import { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Button,
    CircularProgress,
    Typography,
    Alert,
    Snackbar,
    Tooltip
} from '@mui/material';
import axios from 'axios';

// Constants for OAuth window
const OAUTH_CONFIG = {
    width: 600,
    height: 600,
    left: (window.screen.width - 600) / 2,
    top: (window.screen.height - 600) / 2
};

const POLL_INTERVAL = 200;

export const NotionIntegration = ({ user, org, integrationParams, setIntegrationParams }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState(null);
    const [showError, setShowError] = useState(false);
    const [workspaceInfo, setWorkspaceInfo] = useState(null);

    /**
     * Opens OAuth window centered on screen
     */
    const openAuthWindow = useCallback((authUrl) => {
        const features = [
            `width=${OAUTH_CONFIG.width}`,
            `height=${OAUTH_CONFIG.height}`,
            `left=${OAUTH_CONFIG.left}`,
            `top=${OAUTH_CONFIG.top}`,
            'resizable=yes',
            'scrollbars=yes'
        ].join(',');

        return window.open(authUrl, 'Notion Authorization', features);
    }, []);

    /**
     * Initiates Notion OAuth connection
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
                'http://localhost:8000/integrations/notion/authorize',
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
            console.error('Notion connection error:', error);
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
                'http://localhost:8000/integrations/notion/credentials',
                formData,
                { timeout: 10000 }
            );

            const credentials = response.data;
            if (credentials && credentials.access_token) {
                setIsConnected(true);
                setWorkspaceInfo(credentials.workspace_name || 'Unknown Workspace');
                setIntegrationParams(prev => ({
                    ...prev,
                    credentials: credentials,
                    type: 'Notion'
                }));
            } else {
                throw new Error('Invalid credentials received');
            }
        } catch (error) {
            const errorMessage = error?.response?.data?.detail || error.message || 'Failed to retrieve credentials';
            setError(errorMessage);
            setShowError(true);
            console.error('Notion credentials error:', error);
        } finally {
            setIsConnecting(false);
        }
    }, [user, org, setIntegrationParams]);

    const handleErrorClose = useCallback(() => {
        setShowError(false);
        setError(null);
    }, []);

    useEffect(() => {
        const hasCredentials = integrationParams?.credentials && integrationParams.type === 'Notion';
        setIsConnected(hasCredentials);
        if (hasCredentials && integrationParams.credentials?.workspace_name) {
            setWorkspaceInfo(integrationParams.credentials.workspace_name);
        }
    }, [integrationParams]);

    return (
        <>
            <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Notion Integration
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Connect your Notion workspace to access pages and databases
                </Typography>

                {workspaceInfo && (
                    <Typography variant="body2" color="success.main" sx={{ mb: 2 }}>
                        Workspace: {workspaceInfo}
                    </Typography>
                )}

                <Box display='flex' alignItems='center' justifyContent='center' sx={{ mt: 2 }}>
                    <Tooltip title={isConnected ? 'Already connected to Notion' : 'Connect to your Notion workspace'}>
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
                                '✓ Notion Connected'
                            ) : isConnecting ? (
                                <>
                                    <CircularProgress size={20} sx={{ mr: 1 }} />
                                    Connecting...
                                </>
                            ) : (
                                'Connect to Notion'
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
