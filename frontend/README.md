# CivicChain Frontend

Next.js + React + TypeScript + Tailwind CSS frontend for the CivicChain voting platform.

## Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local

# Start development server
npm run dev
```

## Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Pages

- `/` - Home
- `/register` - Voter registration
- `/verify-otp` - OTP verification
- `/book-slot` - Slot booking
- `/login` - Login with credentials
- `/ballot` - Vote casting
- `/confirmation` - Voter-verifiable confirmation slip
- `/feedback` - Feedback form
- `/admin` - Admin dashboard
- `/audit` - Audit trail

## Build

```bash
npm run build
npm start
```
