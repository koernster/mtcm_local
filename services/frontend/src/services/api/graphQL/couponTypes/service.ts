import client from '../client';
import { GET_COUPON_TYPES } from './queries/getCouponTypes';
import { CouponType } from './types/couponType';
import { CacheManager } from '../../../../lib/cacheManager';

class CouponTypesService {
    private static instance: CouponTypesService;
    private couponTypes: CouponType[] | null = null;
    private readonly CACHE_KEY = 'couponTypes';

    private constructor() {}

    public static getInstance(): CouponTypesService {
        if (!CouponTypesService.instance) {
            CouponTypesService.instance = new CouponTypesService();
        }
        return CouponTypesService.instance;
    }

    public async loadCouponTypes() {
        // Try to get from memory first
        if (this.couponTypes) {
            return this.couponTypes;
        }

        // Try to get from cache
        const cachedData = CacheManager.getCache<CouponType[]>(this.CACHE_KEY);
        if (cachedData) {
            this.couponTypes = cachedData;
            return this.couponTypes;
        }

        // If not in cache or expired, fetch from API
        const { data } = await client.query({ query: GET_COUPON_TYPES });
        this.couponTypes = data.copontypes;
        
        // Save to cache
        CacheManager.setCache(this.CACHE_KEY, this.couponTypes);
        
        return this.couponTypes;
    }

    public getCouponTypes() {
        return this.couponTypes;
    }

    public clearCache() {
        this.couponTypes = null;
        CacheManager.clearCache(this.CACHE_KEY);
    }
}

export default CouponTypesService;
