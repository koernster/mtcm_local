export interface Trade {
  id: string;
  bank_investor?: string;
  counterparty?: string;
  discount?: number;
  isinid?: string;
  notional?: number;
  price_dirty?: number;
  reference?: string;
  reofferprice?: number;
  tranfee?: number;
  tradedate?: string;
  valuedate?: string;
  transtatus?: number; // 1 = subscription, 2 = modified
  tradetype?: string;
}

export interface TradeUpdate {
  bank_investor?: string;
  counterparty?: string;
  discount?: number;
  isinid?: string;
  notional?: number;
  price_dirty?: number;
  reference?: string;
  reofferprice?: number;
  tranfee?: number;
  tradedate?: string;
  valuedate?: string;
  transtatus?: number;
  tradetype?: string;
}

export interface TradeInsert {
  id: string; // uuid - required
  bank_investor: string; // required
  counterparty: string; // required
  isinid: string; // uuid - required
  notional: number; // required
  price_dirty?: number; // optional
  reference?: string; // optional
  tranfee?: number; // optional
  tradedate: string; // date - required
  valuedate: string; // date - required
  transtatus?: number; // default value 1
  tradetype: number; // required - either 2 or 3
}

export interface UpdateTradeVariables {
  id: string;
  data: TradeUpdate;
}

export interface UpdateTradeData {
  update_trades_by_pk: Trade;
}

export interface InsertTradeVariables {
  id: string;
  bank_investor: string;
  counterparty: string;
  isinid: string;
  notional: number;
  price_dirty?: number;
  reference?: string;
  tranfee?: number;
  tradedate: string;
  valuedate: string;
  transtatus?: number;
  tradetype: number;
}

export interface InsertTradeData {
  insert_trades_one: Trade;
}

// Flattened types for Buy/Sell trades data
export interface BuySellTradeData {
  id: string;
  tradetypeId: string;
  tradetypeName: string;
  tradedate: string;
  valuedate: string;
  notional: number;
  price_dirty: number;
  tranfee: number;
  counterparty: string;
  bank_investor: string;
  reference: string;
  sales: string;
  createdat: string;
}

// GraphQL response types for trades query
export interface BuySellTradesResponse {
  trades: {
    id: string;
    tradetypeByTradetype: {
      id: string;
      typename: string;
    };
    tradedate: string;
    valuedate: string;
    notional: number;
    price_dirty: number;
    tranfee: number;
    counterparty: string;
    bank_investor: string;
    reference: string;
    sales: string;
    createdat: string;
  }[];
}

export interface BuySellTradesVariables {
  isinid: string;
}