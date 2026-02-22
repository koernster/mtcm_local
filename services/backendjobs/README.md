
# FastAPI Cron Executors

## About the Project

This project is a FastAPI-based backend for managing and executing scheduled jobs (cron events) related to financial operations.  
It includes job logic for notifications, interest rate updates, and compartment status updates, with integration to Hasura GraphQL APIs.

**Main folders and files:**
- `app/main.py`: FastAPI entrypoint.
- `app/api/routes.py`: API endpoints for job execution.
- `app/jobs/`: Contains job logic (e.g., `notification_job.py`, `forward_floating_interest_rate.py`).
- `app/services/`: Service layer for GraphQL and job execution.
- `app/models/`: Pydantic models for data validation.
- `app/utils/`: Utility functions (e.g., template replacer).
- `requirements.txt`: Python dependencies.
- `app/Dockerfile`: Docker build instructions.

## Getting Started

### Local Development

1. **Clone the repository and navigate to the project root:**
   ```bash
   git clone <repo-url>
   cd backendjobs
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   pip install python-dotenv
   ```

4. **Set up environment variables:**
   - Create a `.env` file in the project root or `app/` directory.
   - Example:
     ```
     HASURA_BASE_URL=https://your-hasura-instance
     HASURA_ADMIN_SECRET=your-secret
     CRON_AUTH_TOKEN=your-cron-token
     ```

5. **Run the server:**
   ```bash
   uvicorn app.main:app --reload
   ```
   Or, if you encounter import errors:
   ```bash
   PYTHONPATH=. uvicorn app.main:app --reload
   ```

### Docker Deployment

1. **Build the Docker image:**
   ```bash
   docker build -t backendjobs-app ./app
   ```

2. **Run the container:**
   ```bash
   docker run -d -p 8000:8000 --env-file .env backendjobs-app
   ```

## API Endpoints

- `POST /execute-job`: Executes jobs for today's date.
- `POST /execute-job/{date}`: Executes jobs for a specific date (`MM-DD-YYYY`).

## Hasura CRON Triggers

### Future Enhancement - Automated CRON Setup

The following SQL script can be used to create Hasura CRON triggers programmatically. This feature is not supported in our current Hasura version, but may be used in future updates. Currently, CRON triggers need to be added manually through the Hasura Console.

```sql
-- Create the cron trigger
INSERT INTO hdb_catalog.hdb_cron_triggers (
  name,
  webhook_conf,
  schedule,
  payload,
  headers,
  retry_conf,
  include_in_metadata,
  comment
)
VALUES (
  'MTCM_12_01_AM_TEST',
  json_build_object(
    'url', 'http://172.18.0.8:8084/api/execute-job',
    'method', 'POST'
  ),
  '1 0 * * 1-5',
  '{}'::json,
  json_build_array(
    json_build_object('name', 'X-Internal-Request', 'value', 'true'),
    json_build_object('name', 'X-CRON-Auth-Token', 'value', '{REPLACE THE CORRECT TOKEN FROM OUR CODE.}')
  ),
  json_build_object(
    'num_retries', 3,
    'retry_interval_seconds', 10,
    'timeout_seconds', 60,
    'tolerance_seconds', 21600
  ),
  true,
  'This event is common cron event that runs every day by 12:01 AM except of weekends.'
);
```

**CRON Schedule Explanation:**
- `1 0 * * 1-5`: Runs at 12:01 AM on weekdays (Monday-Friday)
- Includes retry logic with 3 attempts, 10-second intervals
- 60-second timeout with 6-hour tolerance window

**Headers Configuration:**
- `X-Internal-Request`: Identifies internal system calls
- `X-CRON-Auth-Token`: Authentication token for secure access

## Debugging

- **Enable FastAPI debug mode:**  
  Add `--reload` to the Uvicorn command for auto-reload and better error messages.
- **Check logs:**  
  All job execution and errors are printed to the console.
- **Common issues:**
  - `ModuleNotFoundError`: Ensure you run from the project root and set `PYTHONPATH=.`
  - `No module named 'dotenv'`: Install with `pip install python-dotenv`
  - **Docker issues:**  
    Make sure your `.env` file is present and referenced with `--env-file`.

- **Breakpoints:**  
  Use an IDE like VS Code and set breakpoints in Python files for step-by-step debugging.
