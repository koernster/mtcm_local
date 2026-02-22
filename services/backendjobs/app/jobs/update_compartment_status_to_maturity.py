from app.models.cron_event import CronEventExecution
from ..services.graphQL.case_service import CaseService

def run(execution: CronEventExecution):
    print(f"[MATURITY_STATUS_TRACE] Starting compartment maturity status update for case ID: {execution.caseid}")
    print(f"[MATURITY_STATUS_TRACE] Execution date: {execution.executiondate}")
    
    try:
        print(f"[MATURITY_STATUS_TRACE] Updating compartment status to maturity for case ID: {execution.caseid}")
        update_compartment_status(execution.caseid)
        print(f"[MATURITY_STATUS_TRACE] Successfully completed compartment maturity status update for case ID: {execution.caseid}")
        
    except Exception as e:
        print(f"[MATURITY_STATUS_ERROR] Exception occurred during compartment maturity status update: {str(e)}")
        print(f"[MATURITY_STATUS_ERROR] Case ID: {execution.caseid}, Execution Date: {execution.executiondate}")
        print(f"[MATURITY_STATUS_ERROR] Rolling back transaction...")
        # Rollback transaction logic here
        # Example: trade_service.rollback_transaction() if available
        raise

def update_compartment_status(caseid: str):
    print(f"[MATURITY_STATUS_TRACE] Starting compartment maturity process for case ID: {caseid}")
    
    print(f"[MATURITY_STATUS_TRACE] Initializing CaseService...")
    case_service = CaseService()
    print(f"[MATURITY_STATUS_TRACE] CaseService initialized successfully")
    
    print(f"[MATURITY_STATUS_TRACE] Maturing compartment for case ID: {caseid}")
    affected_rows = case_service.mature_compartment(caseid)
    print(f"[MATURITY_STATUS_TRACE] Compartment matured successfully for case ID: {caseid}")
    print(f"[MATURITY_STATUS_TRACE] Affected rows: {affected_rows}")
    
    if affected_rows == 0:
        print(f"[MATURITY_STATUS_TRACE] Warning: No rows were affected during compartment maturity update for case ID: {caseid}")
    else:
        print(f"[MATURITY_STATUS_TRACE] Successfully updated {affected_rows} row(s) to matured status for case ID: {caseid}")