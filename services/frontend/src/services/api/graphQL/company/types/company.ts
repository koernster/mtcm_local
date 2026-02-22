export interface Address {
    id?: string;
    addressline1?: string;
    addressline2?: string;
    city?: string;
    state_or_province?: string;
    country?: string;
    postalcode?: string;
    phone?: string;
    email?: string;
    website?: string;
}

export interface Company {
    id: string;
    hbid: string;
    companyname: string;
    clienttype: boolean;
    addressid?: string;
    addressByAddressid?: Address;
}

export interface CompanyData {
    companies: Company[];
}

export interface CompaniesVariables {
    hbid: string;
}
