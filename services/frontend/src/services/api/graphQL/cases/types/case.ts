export interface Case {
    id: string;
    companyid: string;
    spvid: string;
    spv: {
        id: string;
        companyid?: string;
        spvdescription: string;
        spvtitle: string;
        logo?: string;
        address: {
            id?: string;
            addressline1: string;
            addressline2: string;
            city: string;
            country: string;
            postalcode: string;
            email: string;
            phone: string;
            website: string;
        }
        paymentdetail?: {
            id?: string;
            iban: string;
            bankname: string;
            address: string;
            beneficiary: string;
            bicintermediary: string;
            swift: string;
        }
    };
    compartmentname: string;
    maturitydate: string;
    issuedate: string;
    interestrate: number;
    issueprice: number;
    operationalcosts: number;
    runningcosts: number;
    payingagentcosts: number;
    auditcosts: number;
    legalcosts: number;
    company: {
        id: string;
        companyname: string;
        hbid: string;
        clienttype?: boolean;
        addressByAddressid?: {
            addressline1?: string;
            addressline2?: string;
            city?: string;
            state_or_province?: string;
            country?: string;
            postalcode?: string;
            phone?: string;
            email?: string;
            website?: string;
        };
    };
    underlyingcompanyid?: string;
    companyByUnderlyingcompanyid?: {
        id: string;
        companyname: string;
        addressByAddressid?: {
            addressline1?: string;
            addressline2?: string;
            city?: string;
            state_or_province?: string;
            country?: string;
            postalcode?: string;
            phone?: string;
            email?: string;
            website?: string;
        };
    };
    investtypeid: string;
    investmenttype: {
        id: string;
        typename: string;
    };
    prodtypeid: string;
    producttype: {
        id: string;
        typename: string;
    };
    currencyid: string;
    currency: {
        id: string;
        code: string;
    };
    coponfreqid: string;
    coponfrequency: {
        id: string;
        frequency: string;
    };
    copontypeid: string;
    copontype: {
        id: string;
        typename: string;
    };
    isinnumber: string;
    valoren: string;
    // Financial Structure
    setupfee: number;
    adminfee: number;
    managementfee: number;
    salesfee: number;
    performancefee: number;
    otherfees: number;
    targetissuancenotional: string;
    subscriptiondate: string;
    mintradeamt: number;
    mintradelot: string;

    // Key Dates
    coponpaymentscheduleid: string;
    coponpaymentschedule: {
        id: string;
        typename: string;
    };
    earlyredemptiondate: string;
    coponpaymentdate: string;

    // Parties
    agenttypeid: string;
    payagenttype: {
        id: string;
        typename: string;
    };
    custodian: string;
    custodianByCustodian: {
        id: string;
        custodian: string;
    };

    // Product Setup Status
    productsetupstatusid?: number;
    compartmentstatusid: number;

    // New related tables
    casefee?: CaseFee;
    casecost?: CaseCost;
    case_assetbaskets?: CaseBasketAsset[];
    casesubscriptiondata?: CaseSubscriptionData;

    broker?: string;
    trustee?: string;

    performance?: number;
    performancetype?: number;
}

export interface CaseFee {
    id?: string;
    caseid?: string;
    setupfee?: number;
    setupfeetype?: number;
    adminfee?: number;
    adminfeetype?: number;
    managementfee?: number;
    managementfeetype?: number;
    salesfee?: number;
    salesfeetype?: number;
    performancefee?: number;
    performancefeetype?: number;
    otherfees?: number;
    otherfeestype?: number;
}

export interface CaseCost {
    id?: string;
    caseid?: string;
    operationalcosts?: number;
    operationalcosttype?: number;
    runningcosts?: number;
    runningcosttype?: number;
    payingagentcosts?: number;
    payingagentcosttype?: number;
    auditcosts?: number;
    auditcosttype?: number;
    legalcosts?: number;
    legalcosttype?: number;
}

export interface CaseBasketAsset {
    id?: string;
    caseid?: string | null;
    assetname: string;
    assetvalue: number;
    valuetype: number;
}

export interface CaseSubscriptionData {
    id?: string;
    caseid?: string;
    distributionpaidbyinvs?: boolean;
    salesfeepaidbyinves?: boolean;
    salesnotpaidissuedate?: number;
    salesnotpaidmaturitydate?: number;
}

export interface CasesData {
    cases: Case[];
}

export interface CasesVariables {
    offset: number;
    limit: number;
}

export interface CaseIsin {
    id: string;
    caseid: string;
    isinnumber: string;
    currencyid: string;
    currency: {
        id: string;
        currencyshortname: string;
    };
    issueprice: number;
}

export interface Top10LatestUsedCase {
    id: string;
    compartmentname: string;
    updatedat: string;
    compartmentstatusid: number;
    caseisins: CaseIsin[];
}

export interface Top10LatestUsedData {
    cases: Top10LatestUsedCase[];
}

export interface CaseByCompartmentStatus {
    id: string;
    compartmentname: string;
    productsetupstatusid: number;
    updatedat: string;
}

export interface CasesByCompartmentStatusData {
    cases: CaseByCompartmentStatus[];
    cases_aggregate: {
        aggregate: {
            count: number;
        };
    };
    status: {
        id: string;
        status: string;
        description: string;
        statustype: number;
    }[];
}

export interface CasesByCompartmentStatusVariables {
    statusId: number;
    offset: number;
    limit: number;
}
