# n8n Custom Setup

This repository contains a custom n8n setup with enterprise features enabled.

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   \\\ash
   pnpm install
   \\\
3. Build the project:
   \\\ash
   pnpm run build
   \\\
4. Set required environment variables:
   - N8N_ENCRYPTION_KEY
   - N8N_LICENSE_KEY
   - N8N_ENTERPRISE_FEATURES=true
   - N8N_ENTERPRISE_NODES=true
   - N8N_ENTERPRISE_EDITION=true

5. Start n8n:
   \\\ash
   cd packages/core
   pnpm start
   \\\

## Environment Variables

Create a \.env\ file in the root directory with:

\\\env
N8N_ENCRYPTION_KEY=your_32_char_encryption_key
N8N_LICENSE_KEY=your_license_key
N8N_ENTERPRISE_FEATURES=true
N8N_ENTERPRISE_NODES=true
N8N_ENTERPRISE_EDITION=true
\\\

## Development

- \pnpm install\ - Install dependencies
- \pnpm run build\ - Build all packages
- \pnpm start\ - Start n8n
