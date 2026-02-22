import client from '../client';
import { GET_INVESTMENT_TYPES } from './queries/getInvestmentTypes';
import { InvestmentType } from './types/investmentType';
import { CacheManager } from '../../../../lib/cacheManager';

class InvestmentTypesService {
    private static instance: InvestmentTypesService;
    private investmentTypes: InvestmentType[] | null = null;
    private readonly CACHE_KEY = 'investmentTypes';

    private constructor() {}

    public static getInstance(): InvestmentTypesService {
        if (!InvestmentTypesService.instance) {
            InvestmentTypesService.instance = new InvestmentTypesService();
        }
        return InvestmentTypesService.instance;
    }

    private getDefaultInvestmentType(types: InvestmentType[]): InvestmentType | undefined {
        return types.find(type => type.typename.toLowerCase() === 'single');
    }

    public async loadInvestmentTypes() {
        // Try to get from memory first
        if (this.investmentTypes) {
            return this.investmentTypes;
        }

        // Try to get from cache
        const cachedData = CacheManager.getCache<InvestmentType[]>(this.CACHE_KEY);
        if (cachedData) {
            this.investmentTypes = cachedData;
            return this.investmentTypes;
        }

        // If not in cache or expired, fetch from API
        const { data } = await client.query({ query: GET_INVESTMENT_TYPES });
        this.investmentTypes = data.investmenttypes;
        
        // Save to cache
        CacheManager.setCache(this.CACHE_KEY, this.investmentTypes);
        
        return this.investmentTypes;
    }

    public getInvestmentTypes() {
        return this.investmentTypes;
    }

    public clearCache() {
        this.investmentTypes = null;
        CacheManager.clearCache(this.CACHE_KEY);
    }
}

export default InvestmentTypesService;
