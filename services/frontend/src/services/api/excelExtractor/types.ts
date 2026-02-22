// Types for Excel Extractor Service response

export type ExtractorErrorResult = {
    error: string;
    sheet: string;
};

export type ExtractorTrade = {
    counterParty: string;
    notional: number;
    reference: string | number | null;
    subscriptionCancelled: boolean;
    tradeDate: string;
};

export type ExtractorHeader = {
    ISINNumber: string;
    compartment: string;
    payingAgent: string;
};

export type ExtractorSheetResult = {
    body: ExtractorTrade[];
    header: ExtractorHeader;
    sheet: string;
};

export type ExtractorResponse = ExtractorErrorResult[] | ExtractorSheetResult[];
