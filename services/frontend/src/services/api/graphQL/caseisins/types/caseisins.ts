export interface Currency {
    id: string;
    currencyshortname: string;
}

export interface CouponInterest {
    id: string;
    interestrate: number;
    couponrate: number;
}

export interface CaseIsin {
    id: string;
    caseid: string;
    isinnumber: string;
    valoren: string;
    issuesize: string;
    currencyid: string;
    currency: Currency;
    issueprice: number;
    couponinterests: CouponInterest[];
}

export interface CaseIsinsData {
    caseisins: CaseIsin[];
}

export interface CaseIsinShort {
    id: string;
    isinnumber: string;
}

export interface CaseIsinsShortData {
    caseisins: CaseIsinShort[];
}

export interface CaseIsinsVariables {
    caseid: string;
}

export interface CaseIsinByIdData {
    caseisins_by_pk: CaseIsin;
}

export interface CaseIsinByIdVariables {
    id: string;
}

export interface IsinWithCompartment {
    ID: string;
    IsinNumber: string;
    CompartmentName: string;
    CaseId: string;
}

export interface IsinWithCompartmentData {
    caseisins: {
        id: string;
        isinnumber: string;
        case: {
            id: string;
            compartmentname: string;
        };
    }[];
}

export interface IsinWithCompartmentVariables {
    offset: number;
    limit: number;
}

export interface FilteredIsinWithCompartmentVariables {
    filter: string;
    offset: number;
    limit: number;
}

// Flattened types for Buy/Sell ISIN data
export interface BuySellIsinData {
    id: string;
    isinnumber: string;
    issueprice: number;
    currencyName: string;
    currencyShortName: string;
    issueDate: string;
    maturityDate: string;
    couponTypeId: string;
    couponTypeName: string;
    couponFrequency: string;
    couponInterests: BuySellCouponInterest[];
}

export interface BuySellCouponInterest {
    id: string;
    eventdate: string;
    interestrate: number;
    status: string;
}

// GraphQL response types for Buy/Sell query
export interface BuySellIsinResponse {
    caseisins: {
        id: string;
        isinnumber: string;
        currency: {
            currencyname: string;
            currencyshortname: string;
        };
        issueprice: number;
        case: {
            issuedate: string;
            maturitydate: string;
            copontype: {
                id: string;
                typename: string;
            };
            coponfrequency: {
                frequency: string;
            };
        };
        couponinterests: {
            id: string;
            eventdate: string;
            interestrate: number;
            status: string;
        }[];
    }[];
}

export interface BuySellIsinVariables {
    id: string;
}
