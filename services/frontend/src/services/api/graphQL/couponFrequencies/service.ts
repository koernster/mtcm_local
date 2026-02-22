import client from '../client';
import { GET_COUPON_FREQUENCIES } from './queries/getCouponFrequencies';
import { CouponFrequency } from './types/couponFrequency';
import { CacheManager } from '../../../../lib/cacheManager';

class CouponFrequencyService {
    private static instance: CouponFrequencyService;
    private frequencies: CouponFrequency[] | null = null;
    private readonly CACHE_KEY = 'couponFrequencies';

    private constructor() {}

    public static getInstance(): CouponFrequencyService {
        if (!CouponFrequencyService.instance) {
            CouponFrequencyService.instance = new CouponFrequencyService();
        }
        return CouponFrequencyService.instance;
    }

    public async loadFrequencies() {
        // Try to get from memory first
        if (this.frequencies) {
            return this.frequencies;
        }

        // Try to get from cache
        const cachedData = CacheManager.getCache<CouponFrequency[]>(this.CACHE_KEY);
        if (cachedData) {
            this.frequencies = cachedData;
            return this.frequencies;
        }

        // If not in cache or expired, fetch from API
        const { data } = await client.query({ query: GET_COUPON_FREQUENCIES });
        this.frequencies = data.coponfrequencies;
        
        // Save to cache
        CacheManager.setCache(this.CACHE_KEY, this.frequencies);
        
        return this.frequencies;
    }

    public getFrequencies() {
        return this.frequencies;
    }

    public clearCache() {
        this.frequencies = null;
        CacheManager.clearCache(this.CACHE_KEY);
    }
}

export default CouponFrequencyService;
