import client from '../client';
import { GET_PRODUCT_PROFILE, GET_ALL_PRODUCT_PROFILES } from './queries';
import type { ProductProfile, ProductProfileConfig } from '../../../../types/dynamicForm';
import { CacheManager } from '../../../../lib/cacheManager';

/**
 * Service for managing product profile configurations.
 * 
 * Uses a two-tier caching strategy:
 * 1. In-memory cache for instant access
 * 2. localStorage cache via CacheManager for persistence across page loads
 */
class ProductProfileService {
    private static instance: ProductProfileService;

    // In-memory cache: productTypeId → ProductProfile
    private memoryCache: Map<string, ProductProfile> = new Map();
    private allProfilesLoaded: boolean = false;
    private readonly CACHE_KEY_PREFIX = 'productProfile_';
    private readonly ALL_PROFILES_KEY = 'allProductProfiles';

    private constructor() { }

    public static getInstance(): ProductProfileService {
        if (!ProductProfileService.instance) {
            ProductProfileService.instance = new ProductProfileService();
        }
        return ProductProfileService.instance;
    }

    /**
     * Preload all product profiles into cache.
     * Call on app initialization for instant retrieval.
     */
    public async preloadAllProfiles(): Promise<void> {
        if (this.allProfilesLoaded) {
            return;
        }

        try {
            const { data } = await client.query({
                query: GET_ALL_PRODUCT_PROFILES,
                fetchPolicy: 'network-only',
            });

            const profiles: ProductProfile[] = data.productprofiles || [];

            profiles.forEach((profile: ProductProfile) => {
                this.memoryCache.set(profile.producttypeid, profile);
                // Also save to localStorage for persistence
                CacheManager.setCache(
                    `${this.CACHE_KEY_PREFIX}${profile.producttypeid}`,
                    profile
                );
            });

            this.allProfilesLoaded = true;
        } catch (error) {
            console.error('Failed to preload product profiles:', error);
            throw error;
        }
    }

    /**
     * Get product profile by product type ID.
     * Returns from cache if available, otherwise fetches from DB.
     * Returns null gracefully if table doesn't exist yet.
     */
    public async getProfileByProductTypeId(
        productTypeId: string
    ): Promise<ProductProfile | null> {
        // 1. Check in-memory cache first (instant)
        if (this.memoryCache.has(productTypeId)) {
            return this.memoryCache.get(productTypeId)!;
        }

        // 2. Check localStorage cache
        const cachedProfile = CacheManager.getCache<ProductProfile>(
            `${this.CACHE_KEY_PREFIX}${productTypeId}`
        );
        if (cachedProfile) {
            // Restore to memory cache
            this.memoryCache.set(productTypeId, cachedProfile);
            return cachedProfile;
        }

        // 3. Fetch from database
        try {
            const { data } = await client.query({
                query: GET_PRODUCT_PROFILE,
                variables: { productTypeId },
                fetchPolicy: 'network-only',
            });

            const profile: ProductProfile | null = data.productprofiles?.[0] || null;

            if (profile) {
                // Cache the result
                this.memoryCache.set(productTypeId, profile);
                CacheManager.setCache(
                    `${this.CACHE_KEY_PREFIX}${productTypeId}`,
                    profile
                );
            }

            return profile;
        } catch (error: unknown) {
            // Gracefully handle case when table doesn't exist yet
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage.includes('productprofiles') || errorMessage.includes('not found')) {
                console.warn('ProductProfileService: productprofiles table not found. Using fallback fields.');
                return null;
            }
            console.error('Failed to fetch product profile:', error);
            return null; // Return null instead of throwing to allow fallback
        }
    }

    /**
     * Get profile config directly (convenience method).
     */
    public async getProfileConfig(
        productTypeId: string
    ): Promise<ProductProfileConfig | null> {
        const profile = await this.getProfileByProductTypeId(productTypeId);
        return profile?.profileconfig || null;
    }

    /**
     * Check if profile is already cached (for skippin loading state).
     */
    public isCached(productTypeId: string): boolean {
        // Check memory cache
        if (this.memoryCache.has(productTypeId)) {
            return true;
        }

        // Check localStorage cache
        const cachedProfile = CacheManager.getCache<ProductProfile>(
            `${this.CACHE_KEY_PREFIX}${productTypeId}`
        );
        return cachedProfile !== null;
    }

    /**
     * Get cached profile synchronously (returns null if not cached).
     * Use this when you want to check cache without triggering a fetch.
     */
    public getCachedProfile(productTypeId: string): ProductProfile | null {
        // Check memory cache
        if (this.memoryCache.has(productTypeId)) {
            return this.memoryCache.get(productTypeId)!;
        }

        // Check localStorage cache
        const cachedProfile = CacheManager.getCache<ProductProfile>(
            `${this.CACHE_KEY_PREFIX}${productTypeId}`
        );

        if (cachedProfile) {
            // Restore to memory cache
            this.memoryCache.set(productTypeId, cachedProfile);
            return cachedProfile;
        }

        return null;
    }

    /**
     * Invalidate cache for a specific product type or all profiles.
     */
    public invalidateCache(productTypeId?: string): void {
        if (productTypeId) {
            this.memoryCache.delete(productTypeId);
            CacheManager.clearCache(`${this.CACHE_KEY_PREFIX}${productTypeId}`);
        } else {
            // Clear all
            this.memoryCache.clear();
            this.allProfilesLoaded = false;
            // Clear all profile caches from localStorage
            // Note: This clears individual profile caches
            this.memoryCache.forEach((_, key) => {
                CacheManager.clearCache(`${this.CACHE_KEY_PREFIX}${key}`);
            });
        }
    }

    /**
     * Get all product profiles.
     * Fetches from database if not already loaded.
     */
    public async getAllProfiles(): Promise<ProductProfile[]> {
        try {
            const { data } = await client.query({
                query: GET_ALL_PRODUCT_PROFILES,
                fetchPolicy: 'network-only',
            });

            const profiles: ProductProfile[] = data.productprofiles || [];

            // Update caches
            profiles.forEach((profile: ProductProfile) => {
                this.memoryCache.set(profile.producttypeid, profile);
                CacheManager.setCache(
                    `${this.CACHE_KEY_PREFIX}${profile.producttypeid}`,
                    profile
                );
            });

            this.allProfilesLoaded = true;
            return profiles;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage.includes('productprofiles') || errorMessage.includes('not found')) {
                console.warn('ProductProfileService: productprofiles table not found.');
                return [];
            }
            console.error('Failed to fetch all profiles:', error);
            return [];
        }
    }

    /**
     * Save (upsert) a product profile.
     */
    public async saveProfile(profile: ProductProfile): Promise<ProductProfile> {
        const { UPSERT_PRODUCT_PROFILE } = await import('./queries');

        const { data } = await client.mutate({
            mutation: UPSERT_PRODUCT_PROFILE,
            variables: {
                id: profile.id,
                producttypeid: profile.producttypeid,
                profileconfig: profile.profileconfig,
            },
        });

        const savedProfile = data.insert_productprofiles_one;

        // Update cache
        this.memoryCache.set(savedProfile.producttypeid, savedProfile);
        CacheManager.setCache(
            `${this.CACHE_KEY_PREFIX}${savedProfile.producttypeid}`,
            savedProfile
        );

        return savedProfile;
    }

    /**
     * Delete a product profile.
     */
    public async deleteProfile(id: string): Promise<void> {
        const { DELETE_PRODUCT_PROFILE } = await import('./queries');

        await client.mutate({
            mutation: DELETE_PRODUCT_PROFILE,
            variables: { id },
        });

        // Find and remove from cache
        const profile = Array.from(this.memoryCache.values()).find(p => p.id === id);
        if (profile) {
            this.memoryCache.delete(profile.producttypeid);
            CacheManager.clearCache(`${this.CACHE_KEY_PREFIX}${profile.producttypeid}`);
        }
    }
}

export default ProductProfileService;

