import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createApiInstance } from '../../services/api/api';

interface CreateUserProps {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    groupIds: string[];
}

interface CreateUserResult {
    success: boolean;
    error: string | null;
}

const useCreateUser = (): [(props: CreateUserProps) => Promise<CreateUserResult>, boolean, string | null] => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { keycloak } = useAuth();

    const createUser = async ({ username, email, firstName, lastName, groupIds }: CreateUserProps): Promise<CreateUserResult> => {
        setLoading(true);
        setError(null);

        try {
            const api = createApiInstance(process.env.REACT_APP_KEYCLOAK_API_BASE_URL, keycloak?.token);

            // Create user
            await api.post(`/admin/realms/${process.env.REACT_APP_KEYCLOAK_REALM}/users`, {
                username,
                email,
                firstName,
                lastName,
                enabled: true,
                emailVerified: false
            });

            // Find user ID 
            const searchResponse = await api.get(`/admin/realms/${process.env.REACT_APP_KEYCLOAK_REALM}/users`,
                {
                    params: { username, },
                });

            const user = searchResponse.data.find((user: any) => user.username === username);

            if (!user) {
                throw Error("User not found after creation.");
            }

            // Assign groups
            for (const groupId of groupIds) {
                await api.put(`/admin/realms/${process.env.REACT_APP_KEYCLOAK_REALM}/users/${user.id}/groups/${groupId}`, {});
            }

            // Send password reset email.
            await api.put(`/admin/realms/${process.env.REACT_APP_KEYCLOAK_REALM}/users/${user.id}/execute-actions-email`, ['UPDATE_PASSWORD']);

            setLoading(false);
            return { success: true, error: null };
        } catch (err) {
            setLoading(false);
            let errorMessage = 'Error creating user';
            if (err) {
                const error = err as any;
                if (error.response) {
                    errorMessage = error.response.data.errorMessage;
                }
            }
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    return [createUser, loading, error];
};

export default useCreateUser;
