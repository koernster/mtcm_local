import client from '../client';
import { GET_COUPON_PAYMENT_SCHEDULE_TYPES } from './queries/getCouponPaymentScheduleTypes';
import { CouponPaymentScheduleType } from './types/couponPaymentScheduleType';
import { CacheManager } from '../../../../lib/cacheManager';

class CouponPaymentScheduleTypesService {
    private static instance: CouponPaymentScheduleTypesService;
    private scheduleTypes: CouponPaymentScheduleType[] | null = null;
    private readonly CACHE_KEY = 'couponPaymentScheduleTypes';

    private constructor() {}

    public static getInstance(): CouponPaymentScheduleTypesService {
        if (!CouponPaymentScheduleTypesService.instance) {
            CouponPaymentScheduleTypesService.instance = new CouponPaymentScheduleTypesService();
        }
        return CouponPaymentScheduleTypesService.instance;
    }

    public async loadScheduleTypes() {
        // Try to get from memory first
        if (this.scheduleTypes) {
            return this.scheduleTypes;
        }

        // Try to get from cache
        const cachedData = CacheManager.getCache<CouponPaymentScheduleType[]>(this.CACHE_KEY);
        if (cachedData) {
            this.scheduleTypes = cachedData;
            return this.scheduleTypes;
        }

        // If not in cache or expired, fetch from API
        const { data } = await client.query({ query: GET_COUPON_PAYMENT_SCHEDULE_TYPES });
        this.scheduleTypes = data.coponpaymentscheduletypes;
        
        // Save to cache
        CacheManager.setCache(this.CACHE_KEY, this.scheduleTypes);
        
        return this.scheduleTypes;
    }

    public getScheduleTypes() {
        return this.scheduleTypes;
    }

    public clearCache() {
        this.scheduleTypes = null;
        CacheManager.clearCache(this.CACHE_KEY);
    }
}

export default CouponPaymentScheduleTypesService;
