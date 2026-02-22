import client from '../client';
import { GET_COMPANY_BY_HBID, GET_COMPANY_BY_ID } from './queries/getCompany';
import { INSERT_COMPANY } from './mutations/insertCompany';
import { UPDATE_COMPANY, UPDATE_COMPANY_WITH_ADDRESS } from './mutations/updateCompany';
import { Company, CompanyData, CompaniesVariables } from './types/company';
import { generateUUID } from '../../../../lib/generateUUID';

class CompanyService {
    private static instance: CompanyService;

    private constructor() { }

    public static getInstance(): CompanyService {
        if (!CompanyService.instance) {
            CompanyService.instance = new CompanyService();
        }
        return CompanyService.instance;
    }

    public async getCompanyByHBID(hbid: string): Promise<Company | null> {
        const { data } = await client.query<CompanyData, CompaniesVariables>({
            query: GET_COMPANY_BY_HBID,
            variables: { hbid }
        });

        return data.companies.length > 0 ? data.companies[0] : null;
    }

    public async createCompany(hbid: string, companyname: string, clienttype?: boolean): Promise<Company> {
        const id = generateUUID();
        const { data } = await client.mutate<{ insert_companies_one: Company }>({
            mutation: INSERT_COMPANY,
            variables: { id, hbid, companyname, clienttype }
        });

        return data!.insert_companies_one;
    }

    public async updateCompany(id: string, updates: Partial<Company>): Promise<Company> {
        // Check if address data is being updated
        const hasAddressUpdate = updates.addressByAddressid && 
            Object.keys(updates.addressByAddressid).length > 0;

        if (!hasAddressUpdate) {
            // Simple update without address changes
            const { data } = await client.mutate<{ update_companies_by_pk: Company }>({
                mutation: UPDATE_COMPANY,
                variables: { id, data: updates }
            });
            return data!.update_companies_by_pk;
        }

        // Transaction-based update with address handling (ACID compliant)
        // First, get the current company to check for existing addressid
        const { data: queryData } = await client.query<{ companies_by_pk: Company }>({
            query: GET_COMPANY_BY_ID,
            variables: { id },
            fetchPolicy: 'network-only'
        });
        
        const currentCompany = queryData.companies_by_pk;
        const existingAddressId = currentCompany?.addressid;
        
        // Clean address data by removing GraphQL metadata fields like __typename
        const { __typename, ...cleanAddressData } = updates.addressByAddressid as any;
        const addressData = cleanAddressData;

        // Prepare company data (exclude nested address)
        const companyData: any = { ...updates };
        delete companyData.addressByAddressid;

        if (!existingAddressId) {
            // Create new address and link it to company
            const newAddressId = generateUUID();
            companyData.addressid = newAddressId;
            
            const { data } = await client.mutate<{ update_companies_by_pk: Company }>({
                mutation: UPDATE_COMPANY_WITH_ADDRESS,
                variables: {
                    companyId: id,
                    companyData,
                    addressId: newAddressId, // Pass the new ID (will be skipped in update operation)
                    addressData: { id: newAddressId, ...addressData },
                    addressUpdateData: {},
                    hasAddressId: false
                }
            });
            return data!.update_companies_by_pk;
        } else {
            // Update existing address
            const { data } = await client.mutate<{ update_companies_by_pk: Company }>({
                mutation: UPDATE_COMPANY_WITH_ADDRESS,
                variables: {
                    companyId: id,
                    companyData,
                    addressId: existingAddressId,
                    addressData: {},
                    addressUpdateData: addressData,
                    hasAddressId: true
                }
            });
            return data!.update_companies_by_pk;
        }
    }
}

export default CompanyService;
