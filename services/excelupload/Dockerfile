# Use the official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file
COPY requirements.txt .

# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the function code
COPY main.py .
COPY excel_extractor.py .
COPY test.html .

# Copy SSL certificates
COPY cert.pem .
COPY key.pem .

# Expose port 8080 (standard for Cloud Functions)
EXPOSE 8080

# Run the function using functions-framework
# Run the local HTTPS Flask server for development
CMD ["python", "main.py"]