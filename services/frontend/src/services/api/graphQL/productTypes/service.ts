import client from '../client';
import { GET_PRODUCT_TYPES } from './queries/getProductTypes';
import { ProductType } from './types/productType';
import { CacheManager } from '../../../../lib/cacheManager';

class ProductTypesService {
    private static instance: ProductTypesService;
    private productTypes: ProductType[] | null = null;
    private readonly CACHE_KEY = 'productTypes';

    private constructor() {}

    public static getInstance(): ProductTypesService {
        if (!ProductTypesService.instance) {
            ProductTypesService.instance = new ProductTypesService();
        }
        return ProductTypesService.instance;
    }

    public async loadProductTypes() {
        // Try to get from memory first
        if (this.productTypes) {
            return this.productTypes;
        }

        // Try to get from cache
        const cachedData = CacheManager.getCache<ProductType[]>(this.CACHE_KEY);
        if (cachedData) {
            this.productTypes = cachedData;
            return this.productTypes;
        }

        // If not in cache or expired, fetch from API
        const { data } = await client.query({ query: GET_PRODUCT_TYPES });
        this.productTypes = data.producttypes;
        
        // Save to cache
        CacheManager.setCache(this.CACHE_KEY, this.productTypes);
        
        return this.productTypes;
    }

    public getProductTypes() {
        return this.productTypes;
    }

    public clearCache() {
        this.productTypes = null;
        CacheManager.clearCache(this.CACHE_KEY);
    }
}

export default ProductTypesService;
