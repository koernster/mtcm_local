import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Keycloak, { KeycloakInstance } from 'keycloak-js';
import { createApiInstance, handleResponse } from '../services/api/api';
import { setTokenGetter } from '../services/api/graphQL/client';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getKeycloakConfig } from '../lib/config';

interface AuthContextProps {
  keycloak?: KeycloakInstance;
  isAuthenticated: boolean;
  userGroups: any[];
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// ─── Check if auth bypass is enabled (local dev without Keycloak) ───
const AUTH_BYPASS = process.env.REACT_APP_AUTH_BYPASS === 'true';

// ─── Mock Auth Provider (local dev) ─────────────────────────────────
const MockAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Set a static token getter for Apollo client
    setTokenGetter(() => 'local-dev-token');
    console.log('[Auth] Running in LOCAL DEV mode — Keycloak bypassed');
  }, []);

  // Create a mock keycloak-like object so components that access keycloak?.tokenParsed don't crash
  const mockKeycloak = {
    authenticated: true,
    token: 'local-dev-token',
    tokenParsed: {
      sub: 'local-dev-user',
      name: 'Local Developer',
      email: 'dev@localhost',
      groups: ['admin', 'operations'],
      preferred_username: 'dev-user',
      exp: Math.floor(Date.now() / 1000) + 3600,
    },
    idTokenParsed: {
      sub: 'local-dev-user',
    },
    login: () => Promise.resolve(),
    logout: () => { window.location.href = '/'; },
    updateToken: () => Promise.resolve(false),
  } as unknown as KeycloakInstance;

  return (
    <AuthContext.Provider value={{
      keycloak: mockKeycloak,
      isAuthenticated: true,
      userGroups: ['admin', 'operations'],
      login: () => {},
      logout: () => { window.location.href = '/'; },
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── Real Auth Provider (production with Keycloak) ──────────────────
const KeycloakAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [keycloak, setKeycloak] = useState<KeycloakInstance | undefined>(undefined);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [userGroups, setUserGroups] = useState<any[]>([]);

  useEffect(() => {
    if (!isInitialized) {
      const kcConfig = getKeycloakConfig();
      const keyCloakConfig = {
        url: kcConfig.apiBaseUrl,
        realm: kcConfig.realm,
        clientId: kcConfig.clientId,
      };
      const keycloakInstance = new Keycloak(keyCloakConfig);

      keycloakInstance
        .init({ 
          onLoad: 'login-required', 
          checkLoginIframe: false, 
          redirectUri: kcConfig.redirectUrl 
        })
        .then((authenticated) => {
          setKeycloak(keycloakInstance);
          setIsAuthenticated(authenticated);
          setIsInitialized(true);
          
          // Set the token getter for Apollo client
          setTokenGetter(() => keycloakInstance.token);
        })
        .catch((err) => {
          console.error('Keycloak initialization error:', err);
        });
    }
  }, [isInitialized]);

  useEffect(() => {
    if (keycloak) {
      const initKeycloak = async () => {
        if (keycloak.authenticated) {
          const kcConfig = getKeycloakConfig();
          setInterval(async () => {
            await refreshToken();
          }, kcConfig.refreshTokenInterval);

          const groups = keycloak?.tokenParsed?.groups || [];
          if (groups) {
            setUserGroups(groups);
          }
        }
      }

      initKeycloak();
    }
  }, [keycloak]);

  const login = () => {
    keycloak?.login();
  };

  const logout = () => {
    keycloak?.logout();
  };

  const refreshToken = async () => {
    try {
      await keycloak?.updateToken(30);
    } catch (error) {
      // Token refresh failed silently
    }
  };

  return (
    <AuthContext.Provider value={{ keycloak, isAuthenticated, login, logout, userGroups }}>
      {isInitialized ? children : <LoadingSpinner />}
    </AuthContext.Provider>
  );
};

// ─── Export the right provider based on environment ─────────────────
export const AuthProvider: React.FC<{ children: ReactNode }> = AUTH_BYPASS
  ? MockAuthProvider
  : KeycloakAuthProvider;

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
