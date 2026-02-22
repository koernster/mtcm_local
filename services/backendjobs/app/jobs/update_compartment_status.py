from app.models.cron_event import CronEventExecution
from ..services.graphQL.trade_service import TradeService
from ..services.graphQL.case_service import CaseService

def run(execution: CronEventExecution):
    print(f"[COMPARTMENT_STATUS_TRACE] Starting compartment status update for case ID: {execution.caseid}")
    print(f"[COMPARTMENT_STATUS_TRACE] Execution date: {execution.executiondate}")
    
    try:
        print(f"[COMPARTMENT_STATUS_TRACE] Step 1: Consolidating subscriptions to trades for case ID: {execution.caseid}")
        consolidate_subscriptions_to_trades(execution.caseid)
        print(f"[COMPARTMENT_STATUS_TRACE] Step 1 completed successfully")

        print(f"[COMPARTMENT_STATUS_TRACE] Step 2: Updating compartment status for case ID: {execution.caseid}")
        update_compartment_status(execution.caseid)
        print(f"[COMPARTMENT_STATUS_TRACE] Step 2 completed successfully")
        
        print(f"[COMPARTMENT_STATUS_TRACE] Successfully completed compartment status update for case ID: {execution.caseid}")
        
    except Exception as e:
        print(f"[COMPARTMENT_STATUS_ERROR] Exception occurred during compartment status update: {str(e)}")
        print(f"[COMPARTMENT_STATUS_ERROR] Case ID: {execution.caseid}, Execution Date: {execution.executiondate}")
        print(f"[COMPARTMENT_STATUS_ERROR] Rolling back transaction...")
        # Rollback transaction logic here
        # Example: trade_service.rollback_transaction() if available
        raise

def consolidate_subscriptions_to_trades(caseid: str):
    print(f"[COMPARTMENT_STATUS_TRACE] Starting subscription consolidation for case ID: {caseid}")
    
    print(f"[COMPARTMENT_STATUS_TRACE] Initializing TradeService...")
    trade_service = TradeService()
    print(f"[COMPARTMENT_STATUS_TRACE] TradeService initialized successfully")
    
    print(f"[COMPARTMENT_STATUS_TRACE] Fetching aggregated buy trades for case ID: {caseid}")
    trades = trade_service.get_agg_buy_trades(caseid)
    print(f"[COMPARTMENT_STATUS_TRACE] Found {len(trades)} trade(s) to consolidate for case ID: {caseid}")

    if not trades:
        print(f"[COMPARTMENT_STATUS_TRACE] No trades found to consolidate for case ID: {caseid}")
        return

    # Further trades will be saved back to db as buy from subscriptions state.
    for idx, trade in enumerate(trades, 1):
        print(f"[COMPARTMENT_STATUS_TRACE] Processing trade {idx}/{len(trades)}: {trade}")
        # Save trade back to db as buy from subscriptions state.
        print(f"[COMPARTMENT_STATUS_TRACE] Saving consolidated trade {idx} to database...")
        trade_service.save_trade(trade)
        print(f"[COMPARTMENT_STATUS_TRACE] Successfully saved trade {idx}")
        
    print(f"[COMPARTMENT_STATUS_TRACE] Successfully consolidated {len(trades)} trades for case ID: {caseid}")

def update_compartment_status(caseid: str):
    print(f"[COMPARTMENT_STATUS_TRACE] Starting compartment status update for case ID: {caseid}")
    
    print(f"[COMPARTMENT_STATUS_TRACE] Initializing CaseService...")
    case_service = CaseService()
    print(f"[COMPARTMENT_STATUS_TRACE] CaseService initialized successfully")
    
    print(f"[COMPARTMENT_STATUS_TRACE] Issuing compartment for case ID: {caseid}")
    affected_rows = case_service.issue_compartment(caseid)
    print(f"[COMPARTMENT_STATUS_TRACE] Compartment issued successfully for case ID: {caseid}")
    print(f"[COMPARTMENT_STATUS_TRACE] Affected rows: {affected_rows}")
    
    if affected_rows == 0:
        print(f"[COMPARTMENT_STATUS_TRACE] Warning: No rows were affected during compartment status update for case ID: {caseid}")
    else:
        print(f"[COMPARTMENT_STATUS_TRACE] Successfully updated compartment status for case ID: {caseid}")