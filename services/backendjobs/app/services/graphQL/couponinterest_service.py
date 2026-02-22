import os
from typing import List
import uuid
import requests
from dataclasses import dataclass

@dataclass
class CouponInterest:
    id: str
    isinid: str
    interestrate: float
    eventdate: str
    type: str
    status: int

class CouponInterestService:
    def __init__(self):
        base_url = os.getenv("HASURA_BASE_URL","")
        self.graphql_url = base_url.rstrip("/") + "/v1/graphql"
        self.headers = headers = {
            "content-type": "application/json",
            "x-hasura-admin-secret": os.getenv("HASURA_ADMIN_SECRET", "")
        }

    def get_active_coupon_interests(self, caseid: str) -> List[CouponInterest]:
        query = '''
        query GET_ACTIVE_FLOATING_INTEREST($caseid: uuid!) {
            cases(where: {id: {_eq: $caseid}}) {
                caseisins {
                    couponinterests(where: {status: {_eq: 1}, type: {_eq: "54c954ed-35a9-42d4-87af-40cb546a02f5"}}) {
                        id
                        isinid
                        interestrate
                        eventdate
                        type
                        status
                    }
                }
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
        
        interests = data.get("data", {}).get("cases", [])
        #create a list of CouponInterest objects
        coupon_interests = []

        #loop through casesisins then couponinterests
        for case in interests:
            for isin in case.get("caseisins", []):
                for ci in isin.get("couponinterests", []):
                    coupon_interests.append(CouponInterest(**ci))

        return coupon_interests
    
    def update_coupon_interest_status(self, interest_id: str, status: int):
        mutation = '''
            mutation UpdateCouponInterest(
                $id: uuid!,
                $status: Int
            ) {
                update_couponinterest_by_pk(
                    pk_columns: { id: $id },
                    _set: { 
                        status: $status
                    }
                ) {
                    id
                }
            }
        '''
        variables = {"id": interest_id, "status": status}
        response = requests.post(
            self.graphql_url,
            json={"query": mutation, "variables": variables},
            headers=self.headers
        )
        print(f"response: {response.text}")
        response.raise_for_status()
        return response.json()
    
    def create_new_floating_interest_rate(self, coupon_interest: CouponInterest):
        mutation = '''
            mutation InsertCouponInterest(
                $id: uuid!,
                $isinId: uuid!, 
                $interestRate: numeric!,
                $eventDate: date,
                $status: Int,
                $type: uuid
            ) {
                insert_couponinterest_one(object: {
                    id: $id,
                    isinid: $isinId,
                    interestrate: $interestRate,
                    eventdate: $eventDate,
                    status: $status,
                    type: $type
                }) {
                    id
                    isinid
                    interestrate
                    eventdate
                    status
                    type
                }
            }
        '''
        variables = {
            "id": coupon_interest.id,
            "isinId": coupon_interest.isinid,
            "interestRate": coupon_interest.interestrate,
            "eventDate": coupon_interest.eventdate,
            "type": coupon_interest.type,
            "status": coupon_interest.status
        }
        response = requests.post(
            self.graphql_url,
            json={"query": mutation, "variables": variables},
            headers=self.headers
        )
        print(f"coupon_interest.id: {coupon_interest.id}")
        response.raise_for_status()
        return response.json()
