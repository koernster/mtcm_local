import { useState, useEffect, useCallback, useMemo } from 'react';
import ProductProfileService from '../services/api/graphQL/productProfiles/service';
import type { ProductProfileConfig, TabConfig } from '../types/dynamicForm';

interface UseProductProfileResult {
    /** The loaded profile configuration */
    config: ProductProfileConfig | null;
    /** Whether the profile is currently loading */
    loading: boolean;
    /** Error message if loading failed */
    error: string | null;
    /** Get tab configuration by tab ID */
    getTabConfig: (tabId: string) => TabConfig | undefined;
    /** Force refresh the profile (clears cache) */
    refresh: () => Promise<void>;
}

/**
 * Hook to fetch and manage product profile configuration.
 * 
 * Features:
 * - Automatically fetches profile when productTypeId changes
 * - Uses cached data when available (no loading state for cached profiles)
 * - Provides tab config lookup for easy access
 * 
 * @param productTypeId - The product type ID to fetch profile for
 */
export const useProductProfile = (
    productTypeId: string | null | undefined
): UseProductProfileResult => {
    const [config, setConfig] = useState<ProductProfileConfig | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        if (!productTypeId) {
            setConfig(null);
            setLoading(false);
            setError(null);
            return;
        }

        const service = ProductProfileService.getInstance();

        // If already cached, load instantly without showing loading state
        if (service.isCached(productTypeId)) {
            try {
                const cachedProfile = service.getCachedProfile(productTypeId);
                if (cachedProfile) {
                    setConfig(cachedProfile.profileconfig);
                    setLoading(false);
                    setError(null);
                    return;
                }
            } catch (err) {
                // Fall through to fetch
            }
        }

        // Not cached - show loading state and fetch
        setLoading(true);
        setError(null);

        try {
            const profileConfig = await service.getProfileConfig(productTypeId);
            setConfig(profileConfig);
        } catch (err) {
            setError('Failed to load product profile configuration');
            console.error('Error fetching product profile:', err);
        } finally {
            setLoading(false);
        }
    }, [productTypeId]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const getTabConfig = useCallback(
        (tabId: string): TabConfig | undefined => {
            return config?.tabs.find((tab) => tab.id === tabId);
        },
        [config]
    );

    const refresh = useCallback(async () => {
        if (productTypeId) {
            ProductProfileService.getInstance().invalidateCache(productTypeId);
        }
        await fetchProfile();
    }, [productTypeId, fetchProfile]);

    return useMemo(
        () => ({
            config,
            loading,
            error,
            getTabConfig,
            refresh,
        }),
        [config, loading, error, getTabConfig, refresh]
    );
};

export default useProductProfile;
