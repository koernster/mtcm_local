export interface SubscriptionTrade {
    id: string;
    case_id: string;
    isin_id: string;
    tradedate: string;
    tradetype: string;
    valuedate: string;
    counterparty: string;
    bank_investor: string;
    reference: string;
    sales: string;
    notional: number;
    issueprice: number;
    price_dirty: number;
    salesfee: number;
    discount: number;
    reofferprice: number;
    trantype: string;
    salesfeepaidbyinves: boolean;
    salesnotpaidissuedate: number;
    salesnotpaidmaturitydate: number;
    distributionpaidbyinvs: boolean;
}

export interface SubscriptionTradesData {
    currentTrades: SubscriptionTrade[];
    soldTrades: SubscriptionTrade[];
}

export interface SubscriptionTradesVariables {
    caseId: string;
}
