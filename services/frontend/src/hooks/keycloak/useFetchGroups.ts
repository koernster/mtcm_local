import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createApiInstance, handleResponse } from '../../services/api/api';

interface Group {
    id: string;
    name: string;
}

interface UseFetchUserGroupsResult {
    groups: Group[];
    loading: boolean;
    error: string | null;
}

const useFetchUserGroups = (userId: string | undefined): UseFetchUserGroupsResult => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { keycloak } = useAuth();

    useEffect(() => {
        const fetchUserGroups = async () => {
            setLoading(true);
            setError(null);

            try {
                const api = createApiInstance(process.env.REACT_APP_KEYCLOAK_API_BASE_URL, keycloak?.token);

                // Fetch user groups
                let uri = '';
                if (userId) {
                    uri = `/admin/realms/${process.env.REACT_APP_KEYCLOAK_REALM}/users/${userId}/groups`;
                } else {
                    uri = `/admin/realms/${process.env.REACT_APP_KEYCLOAK_REALM}/groups`;
                }

                const response = await api.get<any[]>(uri);
                const apiResponse = handleResponse(response);

                if (!userId) {
                    //alter response for super admin.
                    apiResponse.data = apiResponse.data.filter(x => x.name !== 'SuperAdmin');
                }

                setGroups(apiResponse.data);
            } catch (err) {
                setError('Error fetching user groups');
            } finally {
                setLoading(false);
            }
        };

        fetchUserGroups();
    }, [userId]);

    return { groups, loading, error };
};

export default useFetchUserGroups;
