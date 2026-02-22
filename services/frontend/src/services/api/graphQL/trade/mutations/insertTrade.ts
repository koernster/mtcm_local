import { gql } from '@apollo/client';

export const INSERT_TRADE = gql`
  mutation InsertTrade(
    $id: uuid!
    $bank_investor: String!
    $counterparty: String!
    $isinid: uuid!
    $notional: numeric!
    $price_dirty: numeric
    $reference: String
    $tranfee: numeric
    $tradedate: timestamp!
    $valuedate: timestamp!
    $transtatus: Int = 1
    $tradetype: Int!
  ) {
    insert_trades_one(object: {
      id: $id
      bank_investor: $bank_investor
      counterparty: $counterparty
      isinid: $isinid
      notional: $notional
      price_dirty: $price_dirty
      reference: $reference
      tranfee: $tranfee
      tradedate: $tradedate
      valuedate: $valuedate
      transtatus: $transtatus
      tradetype: $tradetype
    }) {
      id
      bank_investor
      counterparty
      isinid
      notional
      price_dirty
      reference
      tranfee
      tradedate
      valuedate
      transtatus
      tradetype
    }
  }
`;