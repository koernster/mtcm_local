# Excel Upload Microservice

This project provides a Python-based microservice for extracting data from Excel files. It is designed to be deployed as a containerized microservice or as a Google Cloud Function.

## Features
- Extracts data from Excel files
- REST API endpoint (see `main.py`)
- Dockerized for easy deployment

## Prerequisites
- Python 3.11+
- Docker
- Google Cloud SDK (for GCP deployment)

## Local Development
1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd excelupload
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the service:
   ```bash
   python main.py
   ```

## Docker Deployment
1. Build the Docker image:
   ```bash
   docker build -t excelupload .
   ```
2. Run the container:
   ```bash
   docker run -p 8080:8080 excelupload
   ```

## Deploying to Google Cloud Platform (GCP)

### As a Cloud Run Service
1. **Build and push the image to Google Container Registry:**
   ```bash
   gcloud builds submit --tag gcr.io/<YOUR_PROJECT_ID>/excelupload
   ```
2. **Deploy to Cloud Run:**
   ```bash
   gcloud run deploy excelupload \
     --image gcr.io/<YOUR_PROJECT_ID>/excelupload \
     --platform managed \
     --region <YOUR_REGION> \
     --allow-unauthenticated
   ```
3. **Access the service:**
   - The deployed service URL will be shown in the terminal.

### As a Google Cloud Function
1. **Prepare the function entry point:**
   - Ensure your main handler in `main.py` matches GCP's requirements (e.g., `def main(request): ...`).
2. **Deploy using gcloud:**
   ```bash
   gcloud functions deploy excelupload \
     --runtime python311 \
     --trigger-http \
     --allow-unauthenticated \
     --entry-point main
   ```
3. **Test the function:**
   - Use the provided URL to send requests.

## Notes
- Update `<YOUR_PROJECT_ID>` and `<YOUR_REGION>` with your GCP project details.
- For Cloud Functions, ensure your handler signature matches GCP's requirements.

## License
MIT
