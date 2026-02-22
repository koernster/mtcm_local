import os
import requests

class CouponInterestPaymentService:
    def __init__(self):
        base_url = os.getenv("HASURA_BASE_URL","")
        self.graphql_url = base_url.rstrip("/") + "/v1/graphql"
        self.headers = {
            "content-type": "application/json",
            "x-hasura-admin-secret": os.getenv("HASURA_ADMIN_SECRET", "")
        }
    
    # Read all coupon interest payments for a given ISIN
    def get_coupon_interest_payments_by_isin(self, isin: str):
        query = """
            query GetCouponInterestPayments($isinid: uuid) {
                couponpayments(where: {isinid: {_eq: $isinid}}) {
                    id
                    isinid
                    startdate
                    enddate
                    days
                    interestrate
                    accruedamount
                    paidinterest
                }
            }
        """

        variables = {"isinid": isin}
        
        response = requests.post(
            self.graphql_url,
            json={"query": query, "variables": variables},
            headers=self.headers
        )
        
        response.raise_for_status()
        return response.json().get("data", {}).get("couponpayments", [])
    
    def save_coupon_interest_payments(self, coupon_payment_entries: list[dict]) -> dict:
        """
        Save multiple coupon interest payment entries in a single transaction.
        If any entry fails, the entire transaction is rolled back.
        
        Args:
            coupon_payment_entries: List of coupon payment entry dictionaries
            
        Returns:
            Dictionary containing affected_rows and list of created IDs
            
        Raises:
            Exception: If the transaction fails and needs to be rolled back
        """
        mutation = """
            mutation InsertMultipleCouponPayments($objects: [couponpayments_insert_input!]!) {
                insert_couponpayments(objects: $objects) {
                    affected_rows
                    returning {
                        id
                        isinid
                    }
                }
            }
        """
        
        variables = {"objects": coupon_payment_entries}
        
        response = requests.post(
            self.graphql_url,
            json={"query": mutation, "variables": variables},
            headers=self.headers
        )
        
        # Check for GraphQL errors
        response_data = response.json()
        
        if "errors" in response_data:
            error_messages = [error.get("message", "Unknown error") for error in response_data["errors"]]
            raise Exception(f"GraphQL transaction failed: {'; '.join(error_messages)}")
        
        # Check HTTP status
        response.raise_for_status()
        
        # Return the successful result
        return response_data.get("data", {}).get("insert_couponpayments", {})
        