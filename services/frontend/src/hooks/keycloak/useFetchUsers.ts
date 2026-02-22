import { useEffect, useState } from 'react';
import { createApiInstance, handleResponse } from '../../services/api/api';
import { useAuth } from '../../context/AuthContext';

interface keycloakUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
}

const useFetchUsers = () => {
  const { keycloak } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<keycloakUser[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!keycloak || !keycloak.token) return;

      if (keycloak.authenticated) {
        setLoading(true);
        setError(null);
        const api = createApiInstance(process.env.REACT_APP_KEYCLOAK_API_BASE_URL, keycloak?.token);

        try {
          const response = await api.get<keycloakUser[]>(`/admin/realms/${process.env.REACT_APP_KEYCLOAK_REALM}/users`);
          const apiResponse = handleResponse(response);
          setUsers(apiResponse.data);
        } catch (err) {
          //set error here based on type.
          setError('Access Denied!');
        } finally {
          setLoading(false);
        }
      } else {
        keycloak.login();
      }
    };

    fetchUsers();
  }, [keycloak]);

  return { users, loading, error };
};

export default useFetchUsers;
