import uuid
from datetime import datetime
from typing import Any, Optional

from app.models.case_with_isin import CaseIsin, CaseWithIsin, CaseWithIsin
from app.models.cron_event import CronEventExecution
from app.services.graphQL.case_service import CaseService
from app.services.graphQL.coupon_interest_payment_service import CouponInterestPaymentService
from app.services.graphQL.couponinterest_service import CouponInterest, CouponInterestService
from app.services.graphQL.notification_service import Notification, NotificationService
from app.services.graphQL.trade_service import TradeService

DAYS_IN_YEAR = 360

def run(execution: CronEventExecution) -> None:
    """
    Main entry point for creating coupon payment entries.

    This function is triggered by a cron event. It fetches the relevant case using the provided case ID,
    iterates through all ISINs associated with the case, and processes coupon payment entries for each ISIN.
    """
    print(f"[TRACE] Starting coupon payment entry creation for case ID: {execution.caseid}")
    print(f"[TRACE] Execution date: {execution.executiondate}")
    
    try:
        print("[TRACE] Initializing services...")
        case_service = CaseService()
        coupon_interest_service = CouponInterestService()
        print("[TRACE] Services initialized successfully")

        # Fetch the issued case using the case ID from the cron event execution
        print(f"[TRACE] Fetching case with ID: {execution.caseid}")
        cases = case_service.get_issued_case_with_isin(execution.caseid)
        if not cases:
            print(f"[ERROR] No cases found for case ID: {execution.caseid}")
            save_notification(
                "Automated Process Alert: Case Not Found", 
                f"The automated coupon payment system was unable to locate case with ID: {execution.caseid}. Please verify the case ID is correct."
            )
            return
        
        print(f"[TRACE] Found {len(cases)} case(s) for case ID: {execution.caseid}")
        
        # Fetch the interest rate for this case id
        print(f"[TRACE] Fetching active coupon interests for case ID: {execution.caseid}")
        coupon_interests = coupon_interest_service.get_active_coupon_interests(execution.caseid)
        print(f"[TRACE] Found {len(coupon_interests)} active coupon interest(s)")

        cur_case = cases[0]
        print(f"[TRACE] Processing case: {cur_case.id}, Issue date: {cur_case.issuedate}")
        print(f"[TRACE] Case has {len(cur_case.caseisins)} ISIN(s) to process")
        # Process coupon payment entries for each ISIN in the case
        for idx, isin in enumerate(cur_case.caseisins, 1):
            print(f"[TRACE] Processing ISIN {idx}/{len(cur_case.caseisins)}: {isin.isinnumber} (ID: {isin.id})")
            
            coupon_interest = next((ci for ci in coupon_interests if ci.isinid == isin.id), None)
            if not coupon_interest:
                print(f"[ERROR] No active interest rate found for ISIN: {isin.isinnumber} (ID: {isin.id})")
                save_notification(
                    "Automated Process Alert: Interest Rate Missing", 
                    f"The automated coupon payment system found no active interest rate configuration for ISIN: {isin.isinnumber}. Please contact support."
                )
                continue
            
            print(f"[TRACE] Found coupon interest rate: {coupon_interest.interestrate} for ISIN: {isin.isinnumber}")
            process_isin(isin, cur_case, coupon_interest, execution)
            print(f"[TRACE] Completed processing ISIN: {isin.isinnumber}")

        print(f"[TRACE] Successfully completed coupon payment entry creation for case ID: {execution.caseid}")
        
    except Exception as e:
        print(f"[ERROR] Exception occurred in main run function: {str(e)}")
        print(f"[ERROR] Case ID: {execution.caseid}, Execution Date: {execution.executiondate}")
        save_notification(
            "Automated Process Error: Payment Processing Failed", 
            f"The automated coupon payment system encountered an unexpected error while processing payments.",
            {
                "Error Details": str(e),
                "Case ID": execution.caseid,
                "Execution Date": str(execution.executiondate)
            }
        )

def process_isin(isin: CaseIsin, cur_case: CaseWithIsin, coupon_interest: CouponInterest, execution: CronEventExecution) -> None:
    """
    Processes coupon payment entries for a single ISIN.

    This function calculates the coupon interest for each trade in the ISIN's trade history
    within the relevant date range. It creates a coupon payment entry for each period between trades.
    """
    print(f"[TRACE] Starting process_isin for ISIN: {isin.isinnumber} (ID: {isin.id})")
    print(f"[TRACE] Interest rate: {coupon_interest.interestrate}")
    
    trade_service = TradeService()
    coupon_interest_payment_service = CouponInterestPaymentService()
    print("[TRACE] Trade and coupon interest payment services initialized")

    # Fetch trade history and existing coupon interest payments for the ISIN
    print(f"[TRACE] Fetching trade history for ISIN ID: {isin.id}")
    trade_history = trade_service.get_trade_history_by_days(isin.id)
    print(f"[TRACE] Found {len(trade_history)} trade(s) in history")
    
    print(f"[TRACE] Fetching existing coupon interest payments for ISIN ID: {isin.id}")
    coupon_interest_payments = coupon_interest_payment_service.get_coupon_interest_payments_by_isin(isin.id)
    print(f"[TRACE] Found {len(coupon_interest_payments)} existing coupon payment(s)")

    start = cur_case.issuedate
    end = execution.executiondate
    cumulative_notional = 0
    print(f"[TRACE] Initial period: {start} to {end}")

    # If there are existing coupon interest payments, start from the last payment's end date
    if coupon_interest_payments and len(coupon_interest_payments) > 0:
        last_coupon_entry = max(coupon_interest_payments, key=lambda x: x['enddate'])
        print(f"[TRACE] Found existing payments, adjusting start date from {start} to {last_coupon_entry['enddate']}")
        start = last_coupon_entry['enddate']
        
        # Add notional from trades after the last coupon entry up to the current end date
        trades_after_last_payment = [t for t in trade_history if t.valuedate > last_coupon_entry['enddate'] and t.valuedate <= end]
        print(f"[TRACE] Found {len(trades_after_last_payment)} trade(s) after last payment date")
        
        for trade in trades_after_last_payment:
            cumulative_notional += trade.net_notional
            print(f"[TRACE] Adding notional from trade (date: {trade.valuedate}): {trade.net_notional} (cumulative: {cumulative_notional})")

    # Get trades in the current interest period, sorted by value date
    trades_in_range = sorted(
        [trade for trade in trade_history if trade.valuedate >= start and trade.valuedate <= end],
        key=lambda t: t.valuedate
    )
    print(f"[TRACE] Found {len(trades_in_range)} trade(s) in current interest period ({start} to {end})")
    
    if trades_in_range:
        print(f"[TRACE] Trade dates in range: {[t.valuedate for t in trades_in_range]}")

    # Collect all coupon payment entries for this ISIN
    coupon_payment_entries = []
    print(f"[TRACE] Starting to create coupon payment entries...")

    # For each trade, calculate the coupon payment entry for the period until the next trade or the end date
    for idx, trade in enumerate(trades_in_range):
        print(f"[TRACE] Processing trade {idx + 1}/{len(trades_in_range)}: Value date: {trade.valuedate}, Net notional: {trade.net_notional}")
        
        cpinterestStart_dt = to_datetime(trade.valuedate)
        cpinterestEnd_dt = to_datetime(
            trades_in_range[idx + 1].valuedate if idx + 1 < len(trades_in_range) else end
        )
        days = (cpinterestEnd_dt - cpinterestStart_dt).days
        cumulative_notional += trade.net_notional
        
        accrued_amount = (cumulative_notional * coupon_interest.interestrate * days) / DAYS_IN_YEAR
        
        print(f"[TRACE] Coupon calculation: Period {cpinterestStart_dt.strftime('%Y-%m-%d')} to {cpinterestEnd_dt.strftime('%Y-%m-%d')} ({days} days)")
        print(f"[TRACE] Cumulative notional: {cumulative_notional}, Interest rate: {coupon_interest.interestrate}, Accrued amount: {accrued_amount}")

        coupon_payment_entry = {
            "id": str(uuid.uuid4()),
            "isinid": isin.id,
            "startdate": cpinterestStart_dt.strftime("%Y-%m-%d"),
            "enddate": cpinterestEnd_dt.strftime("%Y-%m-%d"),
            "days": days,
            "interestrate": coupon_interest.interestrate,
            "accruedamount": accrued_amount,
            "paidinterest": 0.0
        }
        
        coupon_payment_entries.append(coupon_payment_entry)
        print(f"[TRACE] Created coupon payment entry with ID: {coupon_payment_entry['id']}")

    # Save all entries in a single transaction
    if coupon_payment_entries:
        print(f"[TRACE] Saving {len(coupon_payment_entries)} coupon payment entries for ISIN: {isin.isinnumber}")
        try:
            result = coupon_interest_payment_service.save_coupon_interest_payments(coupon_payment_entries)
            affected_rows = result.get("affected_rows", 0)
            print(f"[TRACE] Successfully saved {affected_rows} coupon payment entries for ISIN: {isin.id}")
        except Exception as e:
            print(f"[ERROR] Failed to save coupon payment entries for ISIN {isin.isinnumber}: {str(e)}")
            save_notification(
                "Automated Process Error: Payment Entry Failed", 
                f"Transaction failed for ISIN {isin.id}. All entries have been rolled back.",
                {
                    "Error Details": str(e),
                    "ISIN ID": str(isin.id),
                    "ISIN Number": getattr(isin, 'isinnumber', 'N/A'),
                    "Case ID": str(cur_case.id),
                    "Number of Entries": len(coupon_payment_entries)
                }
            )
    else:
        print(f"[TRACE] No coupon payment entries to save for ISIN: {isin.isinnumber}")

def create_bootstrap_alert(title: str, message: str, details: Optional[dict] = None, alert_type: str = "danger") -> str:
    """
    Creates a bootstrap alert HTML with title, message, and optional details.
    
    Args:
        title: The alert title/heading
        message: The main alert message
        details: Optional dictionary of key-value pairs for detailed information
        alert_type: Bootstrap alert type (danger, warning, info, success)
    
    Returns:
        HTML string for the bootstrap alert
    """
    alert_html = f'<div class="alert alert-{alert_type}" role="alert">'
    alert_html += f'<h4 class="alert-heading">{title}</h4>'
    alert_html += f'<p>{message}</p>'
    
    if details:
        alert_html += '<hr>'
        for key, value in details.items():
            alert_html += f'<p class="mb-0"><strong>{key}:</strong> {value}</p>'
    
    alert_html += '</div>'
    return alert_html

def create_html_message(message: str, details: Optional[dict] = None) -> str:
    """
    Creates a simple HTML formatted message with optional details.
    
    Args:
        message: The main message
        details: Optional dictionary of key-value pairs for detailed information
    
    Returns:
        HTML string for the message
    """
    html_message = f'<p>{message}</p>'
    
    if details:
        html_message += '<hr>'
        for key, value in details.items():
            html_message += f'<p><strong>{key}:</strong> {value}</p>'
    
    return html_message

def save_notification(title: str, message: str, details: Optional[dict] = None) -> None:
    """
    Saves a notification with the provided title and message.
    Type is always 'G' and target is always 'everyone'.
    Only errors will be wrapped in bootstrap alert format, others use simple HTML.
    
    Args:
        title: The notification title
        message: The notification message
        details: Optional dictionary of detailed information for errors
    """
    print(f"[TRACE] Creating notification: {title}")
    try:
        notification_service = NotificationService()
        
        # Only use bootstrap alert for errors, simple HTML for others
        if "Error" in title:
            html_message = create_bootstrap_alert(title, message, details, "danger")
        else:
            html_message = create_html_message(message, details)
        
        notification = Notification(
            title=title,
            message=html_message,
            createdat=datetime.now().strftime("%m-%d-%Y"),
            createdby="system",
            type="G",
            target="everyone",
            status=1,
            notificationid=""
        )
        
        notification_id = notification_service.save_notification(notification)
        if notification_id:
            print(f"[TRACE] Notification saved successfully with ID: {notification_id}")
        else:
            print(f"[ERROR] Failed to save notification: {title}")
    except Exception as e:
        print(f"[ERROR] Exception occurred while saving notification '{title}': {e}")

def to_datetime(dt) -> datetime:
    """
    Converts a string or datetime object to a datetime object.
    """
    if isinstance(dt, str):
        result = datetime.fromisoformat(dt)
        print(f"[TRACE] Converted string '{dt}' to datetime: {result}")
        return result
    print(f"[TRACE] Using existing datetime object: {dt}")
    return dt
