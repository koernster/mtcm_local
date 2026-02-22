# *Inorder to build docker images for your local computer you need to run following commands.*
# --------------------------------------------------------------------------------------------

# Build the Docker image
docker build -t mtcm-frontend .

# or
docker build --no-cache -t mtcm-frontend .

# Run the container
docker run -p 3000:3000 mtcm-frontend

# -------------------------------------------------------------------------------------------