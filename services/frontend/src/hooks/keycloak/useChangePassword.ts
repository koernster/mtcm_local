import { useState } from 'react';
import { createApiInstance, handleResponse } from '../../services/api/api';
import { useAuth } from '../../context/AuthContext';

interface UseChangePasswordResult {
    changePassword: (newPassword: string) => Promise<void>;
    loading: boolean;
    error: string | null;
}

const useChangePassword = (): UseChangePasswordResult => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { keycloak } = useAuth();

    const changePassword = async (newPassword: string) => {
        setLoading(true);
        setError(null);

        try {
            const api = createApiInstance(process.env.REACT_APP_KEYCLOAK_API_BASE_URL, keycloak?.token);

            // change password
            const response = await api.put(`/admin/realms/${process.env.REACT_APP_KEYCLOAK_REALM}/users/${keycloak?.idTokenParsed?.sub}/reset-password`,
                {
                    type: 'password',
                    value: newPassword,
                    temporary: false,
                });

            const apiResponse = handleResponse(response);
            if(apiResponse.status !== 200){
                setError('Error changing password');
            }
        } catch (err) {
            console.error('Error changing password:', err);
            setError('Error changing password');
        } finally {
            setLoading(false);
        }
    };

    return { changePassword, loading, error };
};

export default useChangePassword;
