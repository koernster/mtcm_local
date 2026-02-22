from typing import List
from dataclasses import dataclass

@dataclass
class CaseIsin:
    id: str
    isinnumber: str

@dataclass
class CaseWithIsin:
    id: str
    issuedate: str
    maturitydate: str
    caseisins: List[CaseIsin]
