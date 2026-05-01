# CivicChain Backend

## Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run database migrations
npm run prisma:migrate

# Seed with test data
npm run seed

# Start development server
npm run dev
```

## Environment Variables

See `.env.example` for all required variables.

## Database

Uses PostgreSQL with Prisma ORM.

## Smart Contracts

The backend interacts with 4 Solidity smart contracts on an EVM-compatible testnet.
