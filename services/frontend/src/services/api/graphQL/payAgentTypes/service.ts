import client from '../client';
import { GET_PAY_AGENT_TYPES } from './queries/getPayAgentTypes';
import { PayAgentType } from './types/payAgentType';
import { CacheManager } from '../../../../lib/cacheManager';

class PayAgentTypesService {
    private static instance: PayAgentTypesService;
    private payAgentTypes: PayAgentType[] | null = null;
    private readonly CACHE_KEY = 'payAgentTypes';

    private constructor() {}

    public static getInstance(): PayAgentTypesService {
        if (!PayAgentTypesService.instance) {
            PayAgentTypesService.instance = new PayAgentTypesService();
        }
        return PayAgentTypesService.instance;
    }

    public async loadPayAgentTypes() {
        // Try to get from memory first
        if (this.payAgentTypes) {
            return this.payAgentTypes;
        }

        // Try to get from cache
        const cachedData = CacheManager.getCache<PayAgentType[]>(this.CACHE_KEY);
        if (cachedData) {
            this.payAgentTypes = cachedData;
            return this.payAgentTypes;
        }

        // If not in cache or expired, fetch from API
        const { data } = await client.query({ query: GET_PAY_AGENT_TYPES });
        this.payAgentTypes = data.payagenttypes;
        
        // Save to cache
        CacheManager.setCache(this.CACHE_KEY, this.payAgentTypes);
        
        return this.payAgentTypes;
    }

    public getPayAgentTypes() {
        return this.payAgentTypes;
    }

    public clearCache() {
        this.payAgentTypes = null;
        CacheManager.clearCache(this.CACHE_KEY);
    }
}

export default PayAgentTypesService;
