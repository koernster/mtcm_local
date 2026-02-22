import os
import requests
from dotenv import load_dotenv
from typing import List
from ...models.cron_event import CronEventExecutionsResponse

load_dotenv()

class CronService:
    def __init__(self):
        base_url = os.getenv("HASURA_BASE_URL", "")
        self.graphql_url = base_url.rstrip("/") + "/v1/graphql"
        self.headers = {
            "content-type": "application/json",
            "x-hasura-admin-secret": os.getenv("HASURA_ADMIN_SECRET", "")
        }

    def fetch_cron_executions(self, date_of_execution: str) -> CronEventExecutionsResponse:
        query = '''
        query GET_CRON_EXECUTIONS($date_of_execution: date) {
          cron_event_executions(where: {executiondate: {_eq: $date_of_execution}, execution_order: {}}, order_by: {execution_order: asc}) {
            caseid
            event
            cutoffdate
            weekdayof_cutoffdate
            cutoffdateschedule
            executiondate
            execution_order
            title
            template
            target
            targettype
            graphql
          }
        }

        '''
        variables = {"date_of_execution": date_of_execution}
        response = requests.post(
            self.graphql_url,
            json={"query": query, "variables": variables},
            headers=self.headers
        )
        response.raise_for_status()
        data = response.json()
        executions = data.get("data", {}).get("cron_event_executions", [])
        return CronEventExecutionsResponse(cron_event_executions=executions)
