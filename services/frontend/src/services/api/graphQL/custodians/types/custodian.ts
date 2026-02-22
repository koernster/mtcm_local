export interface Custodian {
    id: string;
    custodian: string;
}

export interface CustodiansData {
    custodians: Custodian[];
}

export interface CustodianVariables {
    search?: string;
}

export interface CreateCustodianResponse {
    insert_custodians_one: Custodian;
}
