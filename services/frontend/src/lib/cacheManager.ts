interface CacheData<T> {
    data: T;
    timestamp: number;
}

export class CacheManager {
    private static CACHE_DURATION = 1000 * 60 * 60; // 1 hour in milliseconds

    static setCache<T>(key: string, data: T): void {
        const cacheData: CacheData<T> = {
            data,
            timestamp: Date.now(),
        };
        localStorage.setItem(key, JSON.stringify(cacheData));
    }

    static getCache<T>(key: string): T | null {
        const cachedData = localStorage.getItem(key);
        if (!cachedData) return null;

        const parsedData: CacheData<T> = JSON.parse(cachedData);
        const now = Date.now();

        if (now - parsedData.timestamp > this.CACHE_DURATION) {
            // Cache expired
            localStorage.removeItem(key);
            return null;
        }

        return parsedData.data;
    }

    static clearCache(key: string): void {
        localStorage.removeItem(key);
    }

    static clearAllCache(): void {
        localStorage.clear();
    }
}
