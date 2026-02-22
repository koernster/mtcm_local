import os
import requests
from dotenv import load_dotenv
from typing import List
from ...models.cron_event import CronEventExecutionsResponse

load_dotenv()

class DynamicQueryService:
    def __init__(self):
        base_url = os.getenv("HASURA_BASE_URL", "")
        self.graphql_url = base_url.rstrip("/") + "/v1/graphql"
        self.headers = {
            "content-type": "application/json",
            "x-hasura-admin-secret": os.getenv("HASURA_ADMIN_SECRET", "")
        }
    
    def execute_query(self, query: str, variables: dict) -> dict:
        response = requests.post(
            self.graphql_url,
            json={"query": query, "variables": variables},
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()