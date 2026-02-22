import os
import requests
from typing import List
from ...models.case_with_isin import CaseWithIsin, CaseIsin

class CaseService:
    def __init__(self):
        base_url = os.getenv("HASURA_BASE_URL","")
        self.graphql_url = base_url.rstrip("/") + "/v1/graphql"
        self.headers = headers = {
            "content-type": "application/json",
            "x-hasura-admin-secret": os.getenv("HASURA_ADMIN_SECRET", "")
        }
    
    def get_issued_case_with_isin(self, id: str) -> List[CaseWithIsin]:
        """
        Retrieves a case with the given id and compartmentstatusid, including its ISINs.
        """
        query = '''
            query GetIssuedCaseWithISIN($id: uuid, $compartmentstatusid: Int) {
              cases(where: {id: {_eq: $id}, compartmentstatusid: {_eq: $compartmentstatusid}}) {
                id
                issuedate
                maturitydate
                caseisins {
                  id
                  isinnumber
                }
              }
            }
        '''
        variables = {
            "id": id,
            "compartmentstatusid": 9 # Issued status
        }
        response = requests.post(
            self.graphql_url,
            json={"query": query, "variables": variables},
            headers=self.headers
        )
        response.raise_for_status()
        data = response.json()
        cases_data = data.get("data", {}).get("cases", [])
        
        # Convert raw data to typed objects
        cases = []
        for case_data in cases_data:
            case_isins = [
                CaseIsin(
                    id=isin_data["id"],
                    isinnumber=isin_data["isinnumber"]
                )
                for isin_data in case_data.get("caseisins", [])
            ]
            
            case = CaseWithIsin(
                id=case_data["id"],
                issuedate=case_data["issuedate"],
                maturitydate=case_data["maturitydate"],
                caseisins=case_isins
            )
            cases.append(case)
        
        return cases
    
    def issue_compartment(self, id: str):
        """
        Updates the compartmentstatusid of a case to 9 for the given caseId.
        """
        return self.update_status(id, 9)
    
    def mature_compartment(self, id: str):
        """
        Updates the compartmentstatusid of a case to 11 for the given caseId.
        """
        return self.update_status(id, 11)

    # New method to update compartment status to any given status
    def update_status(self, id: str, status: int):
        """
        Updates the compartmentstatusid of a case to the given status for the given caseId.
        """
        mutation = '''
            mutation UpdateCase($id: uuid!, $data: cases_set_input!) {
                update_cases_by_pk(
                    pk_columns: { id: $id }
                    _set: $data
                ) {
                    compartmentstatusid
                }
            }
        '''
        variables = {
            "id": id,
            "data": {"compartmentstatusid": status}
        }

        response = requests.post(
            self.graphql_url,
            json={"query": mutation, "variables": variables},
            headers=self.headers
        )
        response.raise_for_status()
        data = response.json()
        return data.get("data", {}).get("update_cases_by_pk", {}).get("affected_rows", 0)