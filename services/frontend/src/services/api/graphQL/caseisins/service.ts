import client from '../client';
import { GET_CASE_ISINS, GET_CASE_ISINS_SHORT } from './queries/getCaseIsins';
import { GET_CASE_ISIN_BY_ID } from './queries/getCaseIsinById';
import { GET_ISINS_WITH_COMPARTMENTS, GET_FILTERED_ISINS_WITH_COMPARTMENTS } from './queries/getIsinsWithCompartments';
import { GET_ISIN_FOR_BUYSELL } from './queries/getIsinForBuySell';
import { INSERT_CASE_ISIN } from './mutations/insertCaseIsin';
import { UPDATE_CASE_ISIN } from './mutations/updateCaseIsin';
import { DELETE_CASE_ISIN } from './mutations/deleteCaseIsin';
import { 
    CaseIsin, 
    CaseIsinsData, 
    CaseIsinsVariables, 
    CaseIsinByIdData, 
    CaseIsinByIdVariables,
    IsinWithCompartment,
    IsinWithCompartmentData,
    IsinWithCompartmentVariables,
    FilteredIsinWithCompartmentVariables,
    BuySellIsinData,
    BuySellIsinResponse,
    BuySellIsinVariables,
    CaseIsinShort,
    CaseIsinsShortData
} from './types/caseisins';

class CaseIsinService {
    private static instance: CaseIsinService;

    private constructor() {}

    public static getInstance(): CaseIsinService {
        if (!CaseIsinService.instance) {
            CaseIsinService.instance = new CaseIsinService();
        }
        return CaseIsinService.instance;
    }

    public async getCaseIsinsByCaseIdShort(caseid: string): Promise<CaseIsinShort[]> {
        const { data } = await client.query<CaseIsinsShortData, CaseIsinsVariables>({
            query: GET_CASE_ISINS_SHORT,
            variables: { caseid },
            fetchPolicy: 'network-only' // This ensures we always get fresh data
        });
        return data.caseisins;
    }

    public async getCaseIsinsByCaseId(caseid: string): Promise<CaseIsin[]> {
        const { data } = await client.query<CaseIsinsData, CaseIsinsVariables>({
            query: GET_CASE_ISINS,
            variables: { caseid },
            fetchPolicy: 'network-only' // This ensures we always get fresh data
        });
        return data.caseisins;
    }

    public async getCaseIsinById(id: string): Promise<CaseIsin> {
        const { data } = await client.query<CaseIsinByIdData, CaseIsinByIdVariables>({
            query: GET_CASE_ISIN_BY_ID,
            variables: { id },
            fetchPolicy: 'network-only'
        });
        return data.caseisins_by_pk;
    }

    public async createCaseIsin(
        id: string,
        caseid: string,
        isinnumber: string,
        valoren: string,
        issuesize: string,
        currencyid: string | null,
        issueprice: number
    ): Promise<CaseIsin> {
        const { data } = await client.mutate<{ insert_caseisins_one: CaseIsin }>({
            mutation: INSERT_CASE_ISIN,
            variables: {
                id,
                caseid,
                isinnumber,
                valoren,
                issuesize,
                currencyid,
                issueprice
            }
        });
        return data!.insert_caseisins_one;
    }

    public async updateCaseIsin(id: string, data: Record<string, any>): Promise<CaseIsin> {
        const { data: responseData } = await client.mutate<{ update_caseisins_by_pk: CaseIsin }>({
            mutation: UPDATE_CASE_ISIN,
            variables: { id, data }
        });
        return responseData!.update_caseisins_by_pk;
    }

    public async deleteCaseIsin(id: string): Promise<{ id: string; caseid: string; isinnumber: string }> {
        const { data } = await client.mutate<{ delete_caseisins_by_pk: { id: string; caseid: string; isinnumber: string } }>({
            mutation: DELETE_CASE_ISIN,
            variables: { id }
        });
        return data!.delete_caseisins_by_pk;
    }

    /**
     * Loads paginated ISIN data with compartment names (20 items at a time for lazy loading)
     * @param offset - The starting point for pagination (0 for first page)
     * @param limit - Number of items to load (default: 20)
     * @returns Array of ISINs with their compartment names
     */
    public async getIsinsWithCompartments(offset: number = 0, limit: number = 20): Promise<IsinWithCompartment[]> {
        const { data } = await client.query<IsinWithCompartmentData, IsinWithCompartmentVariables>({
            query: GET_ISINS_WITH_COMPARTMENTS,
            variables: { offset, limit },
            fetchPolicy: 'network-only'
        });
        
        return data.caseisins.map(isin => ({
            ID: isin.id,
            IsinNumber: isin.isinnumber,
            CompartmentName: isin.case.compartmentname,
            CaseId: isin.case.id
        }));
    }

    /**
     * Filters ISIN data by ISIN number or compartment name with pagination support
     * @param searchTerm - The search term to filter by (partial match)
     * @param offset - The starting point for pagination (0 for first page)
     * @param limit - Number of items to load (default: 20)
     * @returns Array of filtered ISINs with their compartment names
     */
    public async filterIsinsByNumberOrCompartment(
        searchTerm: string, 
        offset: number = 0, 
        limit: number = 20
    ): Promise<IsinWithCompartment[]> {
        const filter = `%${searchTerm}%`; // Add wildcards for partial matching
        
        const { data } = await client.query<IsinWithCompartmentData, FilteredIsinWithCompartmentVariables>({
            query: GET_FILTERED_ISINS_WITH_COMPARTMENTS,
            variables: { filter, offset, limit },
            fetchPolicy: 'network-only'
        });
        
        return data.caseisins.map(isin => ({
            ID: isin.id,
            IsinNumber: isin.isinnumber,
            CompartmentName: isin.case.compartmentname,
            CaseId: isin.case.id
        }));
    }

    /**
     * Loads ISIN data for Buy/Sell operations with flattened structure
     * @param id - The ISIN ID to load data for
     * @returns Flattened ISIN data with all related information for Buy/Sell operations
     */
    public async getIsinForBuySell(id: string): Promise<BuySellIsinData | null> {
        const { data } = await client.query<BuySellIsinResponse, BuySellIsinVariables>({
            query: GET_ISIN_FOR_BUYSELL,
            variables: { id },
            fetchPolicy: 'network-only'
        });

        // Return null if no ISIN found
        if (!data.caseisins || data.caseisins.length === 0) {
            return null;
        }

        const isin = data.caseisins[0];

        // Flatten the data structure for easier consumption
        return {
            id: isin.id,
            isinnumber: isin.isinnumber,
            issueprice: isin.issueprice,
            currencyName: isin.currency?.currencyname,
            currencyShortName: isin.currency?.currencyshortname,
            issueDate: isin.case.issuedate,
            maturityDate: isin.case.maturitydate,
            couponTypeId: isin.case.copontype?.id,
            couponTypeName: isin.case.copontype?.typename,
            couponFrequency: isin.case.coponfrequency?.frequency,
            couponInterests: isin.couponinterests.map(interest => ({
                id: interest.id,
                eventdate: interest.eventdate,
                interestrate: interest.interestrate,
                status: interest.status
            }))
        };
    }
}

export default CaseIsinService;
