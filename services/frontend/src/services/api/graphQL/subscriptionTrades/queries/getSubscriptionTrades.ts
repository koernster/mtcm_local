import { gql } from '@apollo/client';

export const GET_SUBSCRIPTION_TRADES = gql`
    query SubscriptionTradesQuery($caseId: uuid!) {
        currentTrades: subscription_trades_view(where: {case_id: {_eq: $caseId}, transtatus: {_lte: 1}}) {
            id
            case_id
            isin_id
            tradedate
            tradetype
            valuedate
            counterparty
            bank_investor
            reference
            sales
            notional
            issueprice
            price_dirty
            salesfee
            discount
            reofferprice
            trantype
            salesfeepaidbyinves
            salesnotpaidissuedate
            salesnotpaidmaturitydate
            distributionpaidbyinvs
        }
        soldTrades: subscription_trades_view(where: {case_id: {_eq: $caseId}, transtatus: {_eq: 3}}) {
            id
            case_id
            isin_id
            tradedate
            tradetype
            valuedate
            counterparty
            bank_investor
            reference
            sales
            notional
            issueprice
            price_dirty
            salesfee
            discount
            reofferprice
            trantype
            salesfeepaidbyinves
            salesnotpaidissuedate
            salesnotpaidmaturitydate
            distributionpaidbyinvs
        }
    }
`;
