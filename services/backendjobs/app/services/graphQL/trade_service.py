import os
import uuid
import requests
from typing import List, Optional
from dataclasses import dataclass
from ...models.trade_history import TradeHistoryByDay

@dataclass
class Trade:
  isinid: str
  tradedate: str
  valuedate: str
  notional: int
  tranfee: int
  counterparty: str
  reference: str
  bank_investor: str
  sales: Optional[str]
  tradetype: int

class TradeService:
    def __init__(self):
        base_url = os.getenv("HASURA_BASE_URL","")
        self.graphql_url = base_url.rstrip("/") + "/v1/graphql"
        self.headers = {
            "content-type": "application/json",
            "x-hasura-admin-secret": os.getenv("HASURA_ADMIN_SECRET", "")
        }

    def get_agg_buy_trades(self, caseid: str) -> List[Trade]:
        query = '''
        query GET_AGG_BUY_TRADES($caseid: uuid!) {
          buy_trade_on_issue(where: {caseid: {_eq: $caseid}}) {
            isinid
            tradedate
            valuedate
            notional
            tranfee
            counterparty
            reference
            bank_investor
            sales
            tradetype
          }
        }
        '''
        variables = {"caseid": caseid}
        response = requests.post(
            self.graphql_url,
            json={"query": query, "variables": variables},
            headers=self.headers
        )
        response.raise_for_status()
        data = response.json()
        trades = data.get("data", {}).get("buy_trade_on_issue", [])
        return [Trade(**trade) for trade in trades]

    def get_trade_history_by_days(self, isinid: str) -> List[TradeHistoryByDay]:
        """
        Retrieves trade history by days for a given ISIN ID.
        """
        query = '''
        query TradeHistoryByDays($p_isinid: uuid!) {
          trades_history_by_days(args: {p_isinid: $p_isinid}, order_by: {valuedate: asc}) {
            valuedate
            net_notional
            loan_cell
          }
        }
        '''
        variables = {"p_isinid": isinid}
        response = requests.post(
            self.graphql_url,
            json={"query": query, "variables": variables},
            headers=self.headers
        )
        response.raise_for_status()
        data = response.json()
        trade_history_data = data.get("data", {}).get("trades_history_by_days", [])
        
        # Convert raw data to typed objects
        return [TradeHistoryByDay(**item) for item in trade_history_data]

    def save_trade(self, trade: Trade):
        mutation = '''
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
        '''
        variables = {
            "id": str(uuid.uuid4()),
            "bank_investor": trade.bank_investor,
            "counterparty": trade.counterparty,
            "isinid": trade.isinid,
            "notional": trade.notional,
            "price_dirty": 0.0,
            "reference": trade.reference,
            "tranfee": trade.tranfee,
            "tradedate": trade.tradedate,
            "valuedate": trade.valuedate,
            "transtatus": 1,
            "tradetype": trade.tradetype
        }
       
        response = requests.post(
            self.graphql_url,
            json={"query": mutation, "variables": variables},
            headers=self.headers
        )
        response.raise_for_status()
        data = response.json()
        return data.get("data", {}).get("insert_trades_one", None)