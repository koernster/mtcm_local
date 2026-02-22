import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getApiConfig } from '../../../../lib/config';

const apiConfig = getApiConfig();

const httpLink = createHttpLink({
  uri: apiConfig.mtcmDbUrl
});

// Function to get the current Keycloak token
let getToken: (() => string | undefined) | null = null;

export const setTokenGetter = (tokenGetter: () => string | undefined) => {
  getToken = tokenGetter;
};

const authLink = setContext((_, { headers }) => {
  const token = getToken?.();

  // Local dev mode: use Hasura admin secret instead of JWT Bearer token
  if (token === 'local-dev-token') {
    return {
      headers: {
        ...headers,
        'x-hasura-admin-secret': process.env.REACT_APP_HASURA_ADMIN_SECRET || 'myadminsecretkey',
      },
    };
  }

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
