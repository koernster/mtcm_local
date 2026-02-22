import client from '../client';
import { GET_CURRENCIES } from './queries/getCurrencies';
import { Currency } from './types';
import { CacheManager } from '../../../../lib/cacheManager';

class CurrencyService {
    private static instance: CurrencyService;
    private currencies: Currency[] | null = null;
    private readonly CACHE_KEY = 'currencies';

    private constructor() {}

    public static getInstance(): CurrencyService {
        if (!CurrencyService.instance) {
            CurrencyService.instance = new CurrencyService();
        }
        return CurrencyService.instance;
    }

    public async loadCurrencies() {
        // Try to get from memory first
        if (this.currencies) {
            return this.currencies;
        }

        // Try to get from cache
        const cachedData = CacheManager.getCache<Currency[]>(this.CACHE_KEY);
        if (cachedData) {
            this.currencies = cachedData;
            return this.currencies;
        }

        // If not in cache or expired, fetch from API
        const { data } = await client.query({ query: GET_CURRENCIES });
        this.currencies = data.currencies;
        
        // Save to cache
        CacheManager.setCache(this.CACHE_KEY, this.currencies);
        
        return this.currencies;
    }

    public getCurrencies() {
        return this.currencies;
    }

    public clearCache() {
        this.currencies = null;
        CacheManager.clearCache(this.CACHE_KEY);
    }
}

export default CurrencyService;
