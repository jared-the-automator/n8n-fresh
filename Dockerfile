FROM n8nio/n8n:1.83.2

USER root

# Install Tesseract and its dependencies
RUN apk add --no-cache \
    tesseract-ocr \
    tesseract-ocr-data-eng

# Install n8n-nodes-tesseractjs
RUN npm install -g n8n-nodes-tesseractjs

# Set environment variables
ENV N8N_CUSTOM_EXTENSIONS="n8n-nodes-tesseractjs"
ENV TESSDATA_PREFIX=/usr/share/tessdata

USER node

CMD ["n8n", "start"]
