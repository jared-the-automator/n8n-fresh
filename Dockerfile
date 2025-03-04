FROM n8nio/n8n:latest

USER root

# Install Tesseract and its dependencies using Alpine package manager
RUN apk add --no-cache \
    tesseract-ocr \
    tesseract-ocr-data-eng

# Switch back to n8n user
USER node

# Set environment variables
ENV TESSDATA_PREFIX=/usr/share/tessdata

# Start n8n
CMD ["n8n", "start"]
