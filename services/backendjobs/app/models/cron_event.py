from tempfile import template
from pydantic import BaseModel
from typing import List, Optional

class CronEventExecution(BaseModel):
    caseid: str
    event: str
    cutoffdate: str
    weekdayof_cutoffdate: str
    cutoffdateschedule: int
    executiondate: str
    execution_order: float
    title: Optional[str] = None
    template: Optional[str] = None
    target: Optional[str] = None
    targettype: Optional[str] = None
    graphql: Optional[str] = None

class CronEventExecutionsResponse(BaseModel):
    cron_event_executions: List[CronEventExecution]
