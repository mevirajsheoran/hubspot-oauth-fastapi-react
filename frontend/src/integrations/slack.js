/**
 * Slack Integration Component
 * ==========================
 *
 * This component handles OAuth2 integration with Slack API.
 * Provides workspace access and channel management capabilities.
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
  Avatar,
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

export const SlackIntegration = ({ user, org, integrationParams, setIntegrationParams }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [workspaceInfo, setWorkspaceInfo] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

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

    return window.open(authUrl, 'Slack Authorization', features);
  }, []);

  /**
   * Initiates Slack OAuth connection
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
        'http://localhost:8000/integrations/slack/authorize',
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
      console.error('Slack connection error:', error);
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
        'http://localhost:8000/integrations/slack/credentials',
        formData,
        { timeout: 10000 }
      );

      const credentials = response.data;
      if (credentials && credentials.access_token) {
        setIsConnected(true);
        setWorkspaceInfo(credentials.team?.name || 'Unknown Workspace');
        setUserInfo(credentials.authed_user || null);
        setIntegrationParams(prev => ({
          ...prev,
          credentials: credentials,
          type: 'Slack'
        }));
      } else {
        throw new Error('Invalid credentials received');
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.detail || error.message || 'Failed to retrieve credentials';
      setError(errorMessage);
      setShowError(true);
      console.error('Slack credentials error:', error);
    } finally {
      setIsConnecting(false);
    }
  }, [user, org, setIntegrationParams]);

  const handleErrorClose = useCallback(() => {
    setShowError(false);
    setError(null);
  }, []);

  useEffect(() => {
    const hasCredentials = integrationParams?.credentials && integrationParams.type === 'Slack';
    setIsConnected(hasCredentials);
    if (hasCredentials) {
      setWorkspaceInfo(integrationParams.credentials?.team?.name || 'Unknown Workspace');
      setUserInfo(integrationParams.credentials?.authed_user || null);
    }
  }, [integrationParams]);

  return (
    <>
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Slack Integration
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Connect to your Slack workspace to access channels and messages
        </Typography>

        {workspaceInfo && (
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={workspaceInfo}
              color="success"
              size="small"
              icon={
                <Avatar sx={{ width: 16, height: 16, bgcolor: 'transparent' }}>
                  {workspaceInfo.charAt(0).toUpperCase()}
                </Avatar>
              }
            />
            {userInfo && (
              <Typography variant="caption" color="text.secondary">
                as {userInfo.name}
              </Typography>
            )}
          </Box>
        )}

        <Box display='flex' alignItems='center' justifyContent='center' sx={{ mt: 2 }}>
          <Tooltip title={isConnected ? 'Connected to Slack' : 'Connect to Slack'}>
            <Button
              variant='contained'
              onClick={isConnected ? undefined : handleConnectClick}
              color={isConnected ? 'success' : 'primary'}
              disabled={isConnecting}
              size='large'
              sx={{
                minWidth: 200,
                textTransform: 'none',
                fontWeight: 'bold',
                backgroundColor: isConnected ? undefined : '#4A154B',
                '&:hover': {
                  backgroundColor: isConnected ? undefined : '#611f64'
                }
              }}
            >
              {isConnected ? (
                '✓ Slack Connected'
              ) : isConnecting ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Connecting...
                </>
              ) : (
                'Connect to Slack'
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
