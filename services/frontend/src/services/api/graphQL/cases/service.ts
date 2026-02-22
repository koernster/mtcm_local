import client from '../client';
import { GET_CASES } from './queries/getCases';
import { SEARCH_CASES } from './queries/searchCases';
import { GET_CASE_BY_ID } from './queries/getCaseById';
import { GET_TOP_10_LATEST_USED } from './queries/getTop10LatestUsed';
import { GET_CASES_BY_COMPARTMENT_STATUS } from './queries/getCasesByCompartmentStatus';
import { 
    INSERT_CASE,
    UPDATE_CASE_COMPANY,
    UPDATE_CASE,
    UPDATE_CASE_FEE, 
    INSERT_CASE_FEE, 
    UPDATE_CASE_COST, 
    INSERT_CASE_COST,
    UPDATE_CASE_SUBSCRIPTION,
    INSERT_CASE_SUBSCRIPTION,
    INSERT_BASKET_ASSET, 
    UPDATE_BASKET_ASSET, 
    DELETE_BASKET_ASSET 
} from './mutations';
import { 
    Case, 
    CasesData, 
    CasesVariables, 
    Top10LatestUsedCase, 
    Top10LatestUsedData,
    CaseByCompartmentStatus,
    CasesByCompartmentStatusData,
    CasesByCompartmentStatusVariables,
    CaseFee,
    CaseCost,
    CaseSubscriptionData,
    CaseBasketAsset
} from './types/case';
import { COMPARTMENT_STATUS_IDS } from '../../../../utils/caseManagementUtils';

interface CacheItem {
    data: Top10LatestUsedCase[];
    timestamp: number;
}

class CaseService {
    private static instance: CaseService;
    private top10Cache: CacheItem | null = null;
    private readonly CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

    private constructor() {}

    public static getInstance(): CaseService {
        if (!CaseService.instance) {
            CaseService.instance = new CaseService();
        }
        return CaseService.instance;
    }

    private isCacheValid(): boolean {
        if (!this.top10Cache) return false;
        const now = new Date().getTime();
        return (now - this.top10Cache.timestamp) < this.CACHE_DURATION;
    }

    public async getTop10LatestUsed(): Promise<Top10LatestUsedCase[]> {
        // Check if we have valid cached data
        if (this.isCacheValid()) {
            return this.top10Cache!.data;
        }

        // Fetch fresh data
        const { data } = await client.query<Top10LatestUsedData>({
            query: GET_TOP_10_LATEST_USED,
            fetchPolicy: 'network-only'
        });

        // Cache the result
        this.top10Cache = {
            data: data.cases,
            timestamp: new Date().getTime()
        };

        return data.cases;
    }    
    
    public async createCase(id: string, compartmentname: string): Promise<Case> {
        const { data } = await client.mutate<{ insert_cases_one: Case }>({ 
            mutation: INSERT_CASE,
            variables: { 
                id, 
                compartmentname,
                compartmentstatusid: COMPARTMENT_STATUS_IDS.PRODUCT_SETUP // Set to product setup by default
            }
        });
        return data!.insert_cases_one;
    }

    public async updateCaseCompany(id: string, companyid: string): Promise<Case> {
        const { data } = await client.mutate<{ update_cases_by_pk: Case }>({ 
            mutation: UPDATE_CASE_COMPANY,
            variables: { id, companyid }
        });
        return data!.update_cases_by_pk;
    }

    public async updateCase(id: string, data: Record<string, any>): Promise<Case> {
        const { data: responseData } = await client.mutate<{ update_cases_by_pk: Case }>({
            mutation: UPDATE_CASE,
            variables: { 
                id,
                data
            }
        });
        return responseData!.update_cases_by_pk;
    }

    public async loadCases(offset: number, limit: number): Promise<Case[]> {
        const { data } = await client.query<CasesData, CasesVariables>({ 
            query: GET_CASES,
            variables: { offset, limit },
            fetchPolicy: 'network-only' // This ensures we always get fresh data
        });
        return data.cases;
    }

    public async searchCases(search: string, offset: number, limit: number): Promise<Case[]> {
        const { data } = await client.query<CasesData, CasesVariables & { search: string }>({
            query: SEARCH_CASES,
            variables: { 
                search: `%${search}%`,
                offset, 
                limit 
            },
            fetchPolicy: 'network-only'
        });
        return data.cases;
    }

    public async getCasesByCompartmentStatus(
        statusId: number, 
        offset: number, 
        limit: number
    ): Promise<{ cases: CaseByCompartmentStatus[]; totalCount: number; statusLookup: Record<number, string> }> {
        const { data } = await client.query<CasesByCompartmentStatusData, CasesByCompartmentStatusVariables>({
            query: GET_CASES_BY_COMPARTMENT_STATUS,
            variables: { statusId, offset, limit },
            fetchPolicy: 'network-only'
        });
        
        // Create status lookup for descriptions
        const statusLookup: Record<number, string> = {};
        data.status.forEach(status => {
            statusLookup[parseInt(status.id)] = status.description;
        });

        return {
            cases: data.cases,
            totalCount: data.cases_aggregate.aggregate.count,
            statusLookup
        };
    }

    public async getCaseById(id: string): Promise<Case> {
        const { data } = await client.query<{ cases_by_pk: Case }>({ 
            query: GET_CASE_BY_ID,
            variables: { id },
            fetchPolicy: 'network-only'
        });
        return data.cases_by_pk;
    }

    public async updateCaseFee(id: string, data: Partial<CaseFee>): Promise<CaseFee> {
        const { data: responseData } = await client.mutate<{ update_casefee_by_pk: CaseFee }>({
            mutation: UPDATE_CASE_FEE,
            variables: { 
                id,
                data
            }
        });
        return responseData!.update_casefee_by_pk;
    }

    public async insertCaseFee(data: Omit<CaseFee, 'id'>): Promise<CaseFee> {
        const { data: responseData } = await client.mutate<{ insert_casefee_one: CaseFee }>({
            mutation: INSERT_CASE_FEE,
            variables: { data }
        });
        return responseData!.insert_casefee_one;
    }

    public async updateCaseCost(id: string, data: Partial<CaseCost>): Promise<CaseCost> {
        const { data: responseData } = await client.mutate<{ update_casecost_by_pk: CaseCost }>({
            mutation: UPDATE_CASE_COST,
            variables: { 
                id,
                data
            }
        });
        return responseData!.update_casecost_by_pk;
    }

    public async insertCaseCost(data: Omit<CaseCost, 'id'>): Promise<CaseCost> {
        const { data: responseData } = await client.mutate<{ insert_casecost_one: CaseCost }>({
            mutation: INSERT_CASE_COST,
            variables: { data }
        });
        return responseData!.insert_casecost_one;
    }

    // Subscription Data Methods
    public async updateCaseSubscription(id: string, data: Partial<CaseSubscriptionData>): Promise<CaseSubscriptionData> {
        const { data: responseData } = await client.mutate<{ update_casesubscriptiondata_by_pk: CaseSubscriptionData }>({
            mutation: UPDATE_CASE_SUBSCRIPTION,
            variables: { 
                id,
                data
            }
        });
        return responseData!.update_casesubscriptiondata_by_pk;
    }

    public async insertCaseSubscription(data: Omit<CaseSubscriptionData, 'id'>): Promise<CaseSubscriptionData> {
        const { data: responseData } = await client.mutate<{ insert_casesubscriptiondata_one: CaseSubscriptionData }>({
            mutation: INSERT_CASE_SUBSCRIPTION,
            variables: { data }
        });
        return responseData!.insert_casesubscriptiondata_one;
    }

    // Basket Asset Methods
    public async insertBasketAsset(data: Omit<CaseBasketAsset, 'id'>): Promise<CaseBasketAsset> {
        const { data: responseData } = await client.mutate<{ insert_case_assetbaskets_one: CaseBasketAsset }>({
            mutation: INSERT_BASKET_ASSET,
            variables: { data }
        });
        return responseData!.insert_case_assetbaskets_one;
    }

    public async updateBasketAsset(id: string, data: Partial<Omit<CaseBasketAsset, 'id' | 'caseid'>>): Promise<CaseBasketAsset> {
        const { data: responseData } = await client.mutate<{ update_case_assetbaskets_by_pk: CaseBasketAsset }>({
            mutation: UPDATE_BASKET_ASSET,
            variables: { id, data }
        });
        return responseData!.update_case_assetbaskets_by_pk;
    }

    public async deleteBasketAsset(id: string): Promise<{ id: string }> {
        const { data: responseData } = await client.mutate<{ delete_case_assetbaskets_by_pk: { id: string } }>({
            mutation: DELETE_BASKET_ASSET,
            variables: { id }
        });
        return responseData!.delete_case_assetbaskets_by_pk;
    }
}

export default CaseService;
