import { createApiInstance } from '../api';
import { HubSpotContactSearchResponse } from './types';

const HB_BASE_URL = process.env.REACT_APP_HUBSPOT_API_URL || '';

// Using relative URL with proxy configuration
export const searchContacts = async (query: string, token?: string): Promise<HubSpotContactSearchResponse> => {
    try {
        console.log('HubSpot API Call:', {
            baseURL: HB_BASE_URL,
            hasToken: !!token,
            tokenPreview: token ? `${token.substring(0, 20)}...` : 'none',
            query
        });
        
        // Create API instance with auth token
        const api = createApiInstance(HB_BASE_URL, token);
        const response = await api.get<HubSpotContactSearchResponse>(
            `/contacts/search`,
            {
                params: { query }
            }
        );
        
        console.log('HubSpot API Success:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('HubSpot API Error:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            config: {
                url: error.config?.url,
                method: error.config?.method,
                baseURL: error.config?.baseURL
            }
        });
        throw error;
    }
};
