from dataclasses import dataclass
from typing import Optional

@dataclass
class TradeHistoryByDay:
    valuedate: str
    net_notional: float
    loan_cell: int