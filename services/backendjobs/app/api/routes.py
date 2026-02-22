from fastapi import APIRouter, BackgroundTasks, Request, HTTPException
from datetime import datetime
from ..services.graphQL.cron_service import CronService
from ..services.job_executor import execute_job as job_execute
import os
from dotenv import load_dotenv

router = APIRouter()
cron_service = CronService()

# Ping endpoint for health check
@router.get("/ping")
def ping():
    return {"message": "pong", "status": "healthy"}

# Authorization function
def authorize_request(request):
    x_internal_request = request.headers.get("X-Internal-Request", "").lower()
    x_cron_auth_token = request.headers.get("X-CRON-Auth-Token", "")
    load_dotenv()

    CRON_AUTH_TOKEN = os.getenv("CRON_AUTH_TOKEN", "mgMGye07eRE8OH2ipoxL1vf2AVF9pJ")

    if x_internal_request != "true" or x_cron_auth_token != CRON_AUTH_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized request.")

# Endpoint with date parameter
@router.post("/execute-job/{date}")
def execute_job_with_date(
    date: str,
    background_tasks: BackgroundTasks,
    request: Request
):
    authorize_request(request)

    try:
        datetime.strptime(date, "%m-%d-%Y")
    except ValueError:
        return {"error": "Date must be in MM-DD-YYYY format."}
    
    return execute_job(date, background_tasks)

# Endpoint without date parameter, defaults to today's date
@router.post("/execute-job")
def execute_job_without_date(
    background_tasks: BackgroundTasks,
    request: Request
):
    authorize_request(request)

    today = datetime.now().strftime("%m-%d-%Y")
    return execute_job(today, background_tasks)

# Common function to fetch and execute jobs
def execute_job(today: str, background_tasks: BackgroundTasks):
    executions = cron_service.fetch_cron_executions(today)
    print(f"Fetched {len(executions.cron_event_executions)} cron event executions for {today}.")
    
    for execution in executions.cron_event_executions:
        background_tasks.add_task(
            job_execute,
            execution
        )
    return {"message": "Job execution started in background."}
