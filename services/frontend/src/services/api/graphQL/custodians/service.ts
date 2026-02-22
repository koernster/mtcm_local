import client from '../client';
import { SEARCH_CUSTODIANS, CREATE_CUSTODIAN } from './queries';
import { Custodian, CustodiansData, CustodianVariables, CreateCustodianResponse } from './types/custodian';
import { generateUUID } from '../../../../lib/generateUUID';

class CustodianService {
    private static instance: CustodianService;

    private constructor() {}

    public static getInstance(): CustodianService {
        if (!CustodianService.instance) {
            CustodianService.instance = new CustodianService();
        }
        return CustodianService.instance;
    }

    public async searchCustodians(search: string): Promise<Custodian[]> {
        const { data } = await client.query<CustodiansData, CustodianVariables>({
            query: SEARCH_CUSTODIANS,
            variables: { search: `%${search}%` },
            fetchPolicy: 'network-only'
        });
        return data.custodians;
    }    
    
    public async createCustodian(custodian: string): Promise<Custodian> {
        const id = generateUUID();
        const { data } = await client.mutate<CreateCustodianResponse>({
            mutation: CREATE_CUSTODIAN,
            variables: { id, custodian }
        });
        return data!.insert_custodians_one;
    }
}

export default CustodianService;
