from app.jobs.update_compartment_status import run as update_compartment_status_run
from app.jobs.update_compartment_status_to_maturity import run as update_compartment_status_to_maturity_run
from app.jobs.forward_floating_interest_rate import run as forward_floating_interest_rate_run
from app.jobs.notification_job import run as notification_job_run
from app.jobs.create_coupon_payment_entry import run as create_coupon_payment_entry_run
from app.models.cron_event import CronEventExecution

NOTIFICATION_EVENTS = [
     "LoanIssuance2Client",
     "MaturityPayment",
     "InterestPayment",
     "CouponPayment",
     "CompartmentPhase2Issue",
     "CompartmentPhase2Maturity",
]

JOB_MAP = {
    # Automated Jobs
    "UpdateCompartmentStatus": update_compartment_status_run,
    "UpdateCouponInterestRate": forward_floating_interest_rate_run,
    "UpdateCompartmentStatus2Maturity": update_compartment_status_to_maturity_run,
    "CreateCouponPaymentEntry": create_coupon_payment_entry_run,
}

# Add notification jobs in a loop for simplicity
for event in NOTIFICATION_EVENTS:
    JOB_MAP[event] = notification_job_run

# Execute the job based on the event type
def execute_job(execution: CronEventExecution):
    job_func = JOB_MAP.get(execution.event)
    if job_func:
        job_func(execution)
    else:
        print(f"Unknown event: {execution.event}")
