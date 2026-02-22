import { gql } from '@apollo/client';

export const GET_ISINS_TRADES_FOR_BUYSELL = gql`
  query GetIsinsTradesForBuySell($isinid: uuid!) {
    trades(where: {isinid: {_eq: $isinid}, tradetype: {_neq: 1}, trantype: {_not: {id: {_eq: 3}}}}) {
      id
      tradetypeByTradetype {
        id
        typename
      }
      tradedate
      valuedate
      notional
      price_dirty
      tranfee
      counterparty
      bank_investor
      reference
      sales
      createdat
    }
  }
`;