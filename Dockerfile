# Use the official n8n image (replace version as needed)
FROM n8nio/n8n:latest

# If you need to install extra packages or customizations, add them here
# Example:
# RUN npm install some-extra-package

# Copy any custom files (optional)
# COPY ./your-custom-folder /data/your-custom-folder

# Set the working directory
WORKDIR /data

# Expose the default n8n port
EXPOSE 5678

# The default entrypoint is fine for n8n
