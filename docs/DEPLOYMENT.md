# CivicChain Deployment Guide

## Quick Start (Local Development)

### 1. Prerequisites

- Node.js 16+ (https://nodejs.org)
- PostgreSQL 12+ (https://www.postgresql.org/download/)
- Git

### 2. Clone & Navigate

```bash
cd civicchain
```

### 3. Setup Smart Contracts

```bash
cd contracts

# Install dependencies
npm install

# Compile contracts
npm run compile

# For local testing: deploy to Hardhat
npx hardhat run scripts/deploy.ts --network hardhat

# Note: For testnet, use --network sepolia or configure your testnet in hardhat.config.ts
```

### 4. Setup Backend

```bash
cd ../backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add:
# - PostgreSQL connection string
# - Contract addresses from step 3
# - SMTP credentials (optional, defaults to console output)
# - JWT secret (change this!)

# Setup database
npm run prisma:migrate

# Seed with test data
npm run seed

# Start backend
npm run dev
```

Backend runs on `http://localhost:3001`

### 5. Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Start frontend
npm run dev
```

Frontend runs on `http://localhost:3000`

### 6. Access the App

Open http://localhost:3000 in your browser

## User Flow Demo

### Pre-Seeded Test Users

5 test users are automatically created:

1. **Alice Johnson** - alice@test.civicchain
2. **Bob Smith** - bob@test.civicchain
3. **Carol Williams** - carol@test.civicchain
4. **David Brown** - david@test.civicchain
5. **Eve Davis** - eve@test.civicchain

All are pre-verified and eligible to vote.

### Testing Steps

1. **Homepage** (http://localhost:3000)
   - Review platform overview
   - Click "Admin Dashboard" or "Register to Vote"

2. **Register** (http://localhost:3000/register)
   - Fill form with test user data
   - In development, OTP appears in backend console
   - Or use any 6-digit code (OTP validation is permissive in dev mode)

3. **Verify OTP** (auto-redirect)
   - Enter OTP from console

4. **Book Slot** (auto-redirect)
   - Select any available 30-minute slot
   - Credentials will be shown in backend console

5. **Login** (http://localhost:3000/login)
   - Enter username and password from console
   - Submit

6. **Vote** (http://localhost:3000/ballot)
   - Select a candidate
   - Review vote is encrypted client-side
   - Submit

7. **Confirmation** (auto-redirect to http://localhost:3000/confirmation)
   - View VVPAT-style confirmation slip
   - Verification ID displayed
   - Print option available
   - View candidate symbol

8. **Admin Dashboard** (http://localhost:3000/admin)
   - View stats: registrations, verifications, votes cast
   - Vote count by candidate
   - Download feedback as CSV

9. **Audit Trail** (http://localhost:3000/audit)
   - View all events: REGISTERED, OTP_VERIFIED, SLOT_BOOKED, LOGIN, VOTE_CAST
   - Pagination support

10. **Feedback** (http://localhost:3000/feedback)
    - Submit feedback about voting experience
    - Provide rating (1-5 stars)

## Environment Variables

### Backend (.env)

```bash
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/civicchain

# JWT (CHANGE THIS!)
JWT_SECRET=dev-secret-key-not-for-production
JWT_EXPIRY=24h

# Blockchain
BLOCKCHAIN_RPC_URL=http://localhost:8545
BLOCKCHAIN_CHAIN_ID=31337
BLOCKCHAIN_PRIVATE_KEY=0x[from contract deployment]

# Contract Addresses (from deployment)
VOTER_REGISTRY_ADDRESS=0x...
VOTING_SESSION_ADDRESS=0x...
BALLOT_COMMITMENT_ADDRESS=0x...
AUDIT_LOG_ADDRESS=0x...

# Email (optional, defaults to console)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-user
SMTP_PASS=your-pass
SMTP_FROM=civicchain@example.com

# Frontend URL for verification links
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Database Setup

### PostgreSQL

Create database:

```bash
createdb civicchain
```

Or via psql:

```sql
CREATE DATABASE civicchain;
```

Update connection string in `.env`:

```
DATABASE_URL=postgresql://username:password@localhost:5432/civicchain
```

Run migrations:

```bash
npm run prisma:migrate
```

### View Database

```bash
# Open Prisma Studio
npm run prisma:studio
```

## Testing Blockchain Integration

### Local Hardhat Network

1. In `contracts/hardhat.config.ts`, ensure hardhat network is configured
2. Run: `npx hardhat node` (in a separate terminal)
3. Update `BLOCKCHAIN_RPC_URL=http://localhost:8545`
4. Deploy contracts to local network

### Testnet (Sepolia)

1. Get testnet ETH from faucet (https://sepoliafaucet.com)
2. Configure network in `hardhat.config.ts`
3. Run: `npx hardhat run scripts/deploy.ts --network sepolia`
4. Update contract addresses in `.env`

### RPC Providers

- **Alchemy**: https://www.alchemy.com
- **Infura**: https://infura.io
- **QuickNode**: https://www.quicknode.com
- **Public RPC**: https://eth.merkle.io (Sepolia)

## Production Deployment

### Frontend (Vercel)

```bash
cd frontend

# Build
npm run build

# Deploy to Vercel
vercel deploy --prod

# Set environment variables in Vercel dashboard:
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### Backend (Railway/Render/AWS)

**Railway Example:**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up

# Set environment variables in Railway dashboard
```

**Environment on Production:**
- Update `FRONTEND_URL` to production URL
- Use strong `JWT_SECRET`
- Enable HTTPS
- Set `NODE_ENV=production`
- Configure rate limiting
- Use managed PostgreSQL

### Smart Contracts (Testnet/Mainnet)

```bash
cd contracts

# Deploy to Sepolia
npx hardhat run scripts/deploy.ts --network sepolia

# Verify on Etherscan
npx hardhat verify --network sepolia 0xContractAddress

# Record addresses for production backend
```

## Troubleshooting

### "Cannot find module" errors

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Database connection refused

```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT 1"

# Verify connection string in .env
DATABASE_URL=postgresql://user:password@localhost:5432/civicchain
```

### Blockchain RPC errors

```bash
# Verify RPC endpoint is accessible
curl http://localhost:8545

# Check contract addresses are deployed
npm run compile
npx hardhat run scripts/deploy.ts --network hardhat
```

### Port already in use

```bash
# Backend port 3001
lsof -i :3001
kill -9 <PID>

# Frontend port 3000
lsof -i :3000
kill -9 <PID>
```

### OTP not appearing

In development, check backend console for OTP code before sending email.

For production, configure SMTP in `.env`.

## Monitoring

### Backend Logs

```bash
# Run with logging
npm run dev

# Check for errors in console
```

### Database Queries

```bash
# Open Prisma Studio
npm run prisma:studio

# View real-time queries and data
```

### Blockchain Events

```bash
# In contracts directory
npx hardhat run scripts/getEvents.ts --network hardhat

# Or check with ethers.js:
const events = await contract.queryFilter("VoteCast");
```

## Cleanup

### Reset Database

```bash
# Drop and recreate
npm run prisma:migrate reset

# Or:
dropdb civicchain
createdb civicchain
npm run prisma:migrate
npm run seed
```

### Reset Blockchain

```bash
# Restart Hardhat node
# Or clear state in hardhat.config.ts
```

## Performance Tuning

### Database

- Add indexes (already in schema)
- Enable SSL connection
- Use connection pooling
- Archive old audit events

### API

- Add caching layer (Redis)
- Implement rate limiting
- Compress responses
- Use CDN for static assets

### Frontend

- Enable Next.js ISR (Incremental Static Regeneration)
- Optimize images
- Lazy load components
- Minimize JavaScript bundle

## Next Steps

1. **Development**: Test full voter flow with test users
2. **Security**: Review SECURITY.md
3. **Testing**: Run test suite (`npm test`)
4. **Integration**: Connect to real blockchain
5. **Production**: Deploy following production checklist

---

For more information:
- See [README.md](../README.md)
- See [ARCHITECTURE.md](../docs/ARCHITECTURE.md)
- See [SECURITY.md](../docs/SECURITY.md)
