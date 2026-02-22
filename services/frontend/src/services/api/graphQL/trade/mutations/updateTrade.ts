import { gql } from '@apollo/client';

export const UPDATE_TRADE = gql`
  mutation UpdateTrade($id: uuid!, $data: trades_set_input!) {
    update_trades_by_pk(
      pk_columns: { id: $id }
      _set: $data
    ) {
      id
      bank_investor
      counterparty
      discount
      isinid
      notional
      price_dirty
      reference
      reofferprice
      tranfee
      valuedate
      transtatus
    }
  }
`;