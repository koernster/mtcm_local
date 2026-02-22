import client from '../client';
import { GET_STATUS } from './queries/getStatus';
import { Status, StatusType } from './types/status';
import { CacheManager } from '../../../../lib/cacheManager';

class StatusService {
    private static instance: StatusService;
    private statusList: Status[] | null = null;
    private readonly CACHE_KEY = 'status';

    private constructor() {}

    public static getInstance(): StatusService {
        if (!StatusService.instance) {
            StatusService.instance = new StatusService();
        }
        return StatusService.instance;
    }

    public async loadStatus() {
        // Try to get from memory first
        if (this.statusList) {
            return this.statusList;
        }

        // Try to get from cache
        const cachedData = CacheManager.getCache<Status[]>(this.CACHE_KEY);
        if (cachedData) {
            this.statusList = cachedData;
            return this.statusList;
        }

        // If not in cache or expired, fetch from API
        const { data } = await client.query({ query: GET_STATUS });
        this.statusList = data.status;
        
        // Save to cache
        CacheManager.setCache(this.CACHE_KEY, this.statusList);
        
        return this.statusList;
    }

    public getStatus() {
        return this.statusList;
    }

    public getStatusById(id: string): Status | undefined {
        return this.statusList?.find(status => status.id === id);
    }

    public getStatusByName(statusName: string): Status | undefined {
        return this.statusList?.find(status => status.status === statusName);
    }

    public getStatusByType(statusType: StatusType): Status[] {
        return this.statusList?.filter(status => status.statustype === statusType) || [];
    }

    public getProductSetupStatus(): Status[] {
        return this.getStatusByType(StatusType.ProductSetupStatus);
    }

    public getCompartmentStatus(): Status[] {
        return this.getStatusByType(StatusType.CompartmentStatus);
    }

    public clearCache() {
        this.statusList = null;
        CacheManager.clearCache(this.CACHE_KEY);
    }
}

export default StatusService;
