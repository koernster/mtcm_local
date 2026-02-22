import uuid
from app.models.cron_event import CronEventExecution
from app.services.graphQL.couponinterest_service import CouponInterest, CouponInterestService

def run(execution: CronEventExecution):
    print(f"[FLOATING_RATE_TRACE] Starting floating interest rate update for case ID: {execution.caseid}")
    print(f"[FLOATING_RATE_TRACE] Execution date: {execution.executiondate}")
    
    try:
        print("[FLOATING_RATE_TRACE] Initializing CouponInterestService...")
        service = CouponInterestService()
        print("[FLOATING_RATE_TRACE] Service initialized successfully")
        
        print(f"[FLOATING_RATE_TRACE] Fetching active coupon interests for case ID: {execution.caseid}")
        interests = service.get_active_coupon_interests(execution.caseid)
        print(f"[FLOATING_RATE_TRACE] Found {len(interests)} active floating interest rate(s)")

        if not interests:
            print(f"[FLOATING_RATE_TRACE] No active floating interest rates found for case ID: {execution.caseid}")
            return

        # update active floating rates to historical state.
        for idx, interest in enumerate(interests, 1):
            print(f"[FLOATING_RATE_TRACE] Processing interest {idx}/{len(interests)}: ID {interest.id}")
            print(f"[FLOATING_RATE_TRACE] Current rate: {interest.interestrate}, ISIN: {interest.isinid}, Event date: {interest.eventdate}")
            
            # Here you would add the logic to update the interest rate status to historical.
            print(f"[FLOATING_RATE_TRACE] Updating interest rate {interest.id} status to historical (status=2)")
            service.update_coupon_interest_status(interest.id, status=2)  # status=2 means historical
            print(f"[FLOATING_RATE_TRACE] Successfully updated interest rate {interest.id} to historical status")

            print(f"[FLOATING_RATE_TRACE] Creating new floating interest rate for next period...")
            new_interest_id = str(uuid.uuid4())
            new_interest = CouponInterest(
                id=new_interest_id,
                isinid=interest.isinid,
                interestrate=interest.interestrate,
                eventdate=execution.executiondate,
                type=interest.type,
                status=1  # status=1 means current 
            )
            
            print(f"[FLOATING_RATE_TRACE] New interest details: ID {new_interest_id}, Rate: {new_interest.interestrate}, ISIN: {new_interest.isinid}")
            service.create_new_floating_interest_rate(new_interest)
            print(f"[FLOATING_RATE_TRACE] Successfully created new floating interest rate with ID: {new_interest_id}")
            
        print(f"[FLOATING_RATE_TRACE] Successfully completed floating interest rate update for case ID: {execution.caseid}")
        print(f"[FLOATING_RATE_TRACE] Processed {len(interests)} interest rate(s) total")
        
    except Exception as e:
        print(f"[FLOATING_RATE_ERROR] Exception occurred during floating interest rate update: {str(e)}")
        print(f"[FLOATING_RATE_ERROR] Case ID: {execution.caseid}, Execution Date: {execution.executiondate}")
        raise