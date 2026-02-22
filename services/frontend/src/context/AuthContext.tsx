import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Keycloak, { KeycloakInstance } from 'keycloak-js';
import { createApiInstance, handleResponse } from '../services/api/api';
import { setTokenGetter } from '../services/api/graphQL/client';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getKeycloakConfig } from '../lib/config';

// ─── Local Dev Mode ─────────────────────────────────────────────────────────
// When Keycloak is unreachable (local Docker without Keycloak), we fall back
// to a mock identity so the app renders with full SuperAdmin access.
const LOCAL_DEV_GROUPS = ['Operations', 'SuperAdmin', 'operations', 'default-roles-mtcm-test', 'admin', 'user'];
const LOCAL_DEV_USER = {
  name: 'Local Developer',
  email: 'dev@localhost',
  sub: 'local-dev-user-id',
  groups: LOCAL_DEV_GROUPS,
};

interface AuthContextProps {
  keycloak?: KeycloakInstance;
  isAuthenticated: boolean;
  userGroups: any[];
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [keycloak, setKeycloak] = useState<KeycloakInstance | undefined>(undefined);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false); // Flag to ensure initialization occurs only once
  const [userGroups, setUserGroups] = useState<any[]>([]);

  // ─── Helper: activate local dev fallback (no Keycloak) ───
  const activateLocalDevMode = (reason: string) => {
    console.warn(`Keycloak unavailable (${reason}) — falling back to local dev mode`);
    const mockKeycloak = {
      authenticated: true,
      token: 'local-dev-token',
      tokenParsed: { ...LOCAL_DEV_USER },
      idTokenParsed: { ...LOCAL_DEV_USER },
      login: () => {},
      logout: () => { window.location.reload(); },
      updateToken: () => Promise.resolve(false),
    } as unknown as KeycloakInstance;

    setKeycloak(mockKeycloak);
    setIsAuthenticated(true);
    setUserGroups(LOCAL_DEV_GROUPS);
    setIsInitialized(true);
    setTokenGetter(() => 'local-dev-token');
  };

  useEffect(() => {
    if (!isInitialized) {
      const kcConfig = getKeycloakConfig();

      // ─── Pre-flight check: is Keycloak actually reachable? ───
      // The openid-configuration endpoint is a lightweight probe.
      const kcWellKnown = `${kcConfig.apiBaseUrl}/realms/${kcConfig.realm}/.well-known/openid-configuration`;
      fetch(kcWellKnown, { signal: AbortSignal.timeout(3000) })
        .then((res) => {
          if (!res.ok || !res.headers.get('content-type')?.includes('json')) {
            throw new Error(`Unexpected response: ${res.status}`);
          }
          return res.json();
        })
        .then((json) => {
          // Keycloak responded — proceed with real init
          if (!json.authorization_endpoint) throw new Error('Not a Keycloak response');

          const keycloakInstance = new Keycloak({
            url: kcConfig.apiBaseUrl,
            realm: kcConfig.realm,
            clientId: kcConfig.clientId,
          });

          return keycloakInstance
            .init({
              onLoad: 'login-required',
              checkLoginIframe: false,
              redirectUri: kcConfig.redirectUrl,
            })
            .then((authenticated) => {
              setKeycloak(keycloakInstance);
              setIsAuthenticated(authenticated);
              setIsInitialized(true);
              setTokenGetter(() => keycloakInstance.token);
            });
        })
        .catch((err) => {
          activateLocalDevMode(err?.message || 'unreachable');
        });
    }
  }, [isInitialized]); // Dependency ensures this runs only when `isInitialized` is false

  useEffect(() => {
    if (keycloak) {
      const initKeycloak = async () => {
        //when user is authenticated get required details and refresh token after every interval.
        if (keycloak.authenticated) {
          //refresh token after every interval
          const kcConfig = getKeycloakConfig();
          setInterval(async () => {
            await refreshToken();
          }, kcConfig.refreshTokenInterval);

          //get groups of user.
          const groups = keycloak?.tokenParsed?.groups || []; //await fetchUserGroups();
          if (groups && groups.length > 0) {
            setUserGroups(groups);
          }

          //get more details when needed.
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
      //const refreshed = 
      await keycloak?.updateToken(30); // Refresh if token expires in less than 30 seconds
      // if (refreshed) {
      //   console.log('Token refreshed');
      // } else {
      //   console.log('Token not refreshed, valid for', Math.ceil(keycloak?.tokenParsed?.exp! - new Date().getTime() / 1000), 'seconds');
      // }
    } catch (error) {
      //console.error('Failed to refresh token:', error);
    }
  };

  const fetchUserGroups = async () => {
    try {
      //console.log(keycloak?.tokenParsed?.groups);

      const kcConfig = getKeycloakConfig();
      const api = createApiInstance(kcConfig.apiBaseUrl, keycloak?.token);

      // Fetch user groups
      const response = await api.get<any[]>(`/admin/realms/${kcConfig.realm}/users/${keycloak?.idTokenParsed?.sub}/groups`);
      const apiResponse = handleResponse(response);

      return apiResponse.data;
    } catch (err) {
      console.log('Error fetching user groups');
    }
  };

  return (
    <AuthContext.Provider value={{ keycloak, isAuthenticated, login, logout, userGroups }}>
      {isInitialized ? children : <LoadingSpinner />}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
