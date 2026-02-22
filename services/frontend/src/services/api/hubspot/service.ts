import { createApiInstance } from '../api';
import { HubSpotContactSearchResponse } from './types';

const HB_BASE_URL = process.env.REACT_APP_HUBSPOT_API_URL || '';

// Using relative URL with proxy configuration
export const searchContacts = async (query: string, token?: string): Promise<HubSpotContactSearchResponse> => {
    try {
        // Create API instance with auth token
        const api = createApiInstance(HB_BASE_URL, token);
        const response = await api.get<HubSpotContactSearchResponse>(
            `/contacts/search`,
            {
                params: { query }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error searching contacts:', error);
        throw error;
    }
};
