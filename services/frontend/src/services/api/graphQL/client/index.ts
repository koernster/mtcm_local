import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getApiConfig } from '../../../../lib/config';

const apiConfig = getApiConfig();
const AUTH_BYPASS = process.env.REACT_APP_AUTH_BYPASS === 'true';

const httpLink = createHttpLink({
  uri: apiConfig.mtcmDbUrl
});

// Function to get the current Keycloak token
let getToken: (() => string | undefined) | null = null;

export const setTokenGetter = (tokenGetter: () => string | undefined) => {
  getToken = tokenGetter;
};

const authLink = setContext((_, { headers }) => {
  // In local dev mode, use Hasura admin secret directly
  if (AUTH_BYPASS) {
    return {
      headers: {
        ...headers,
        'x-hasura-admin-secret': 'myadminsecretkey',
        'x-hasura-role': 'admin',
      },
    };
  }

  // Production: use Keycloak JWT token
  const token = getToken?.();
  return {
    headers: {
      ...headers,
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;
