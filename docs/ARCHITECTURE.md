# ElectChain Architecture Document

## Overview
ElectChain is a privacy-preserving, verifiable digital voting platform built on the Stellar blockchain. It ensures election integrity through an immutable audit trail while maintaining voter anonymity using client-side encryption.

## Tech Stack
- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Lucide Icons, Framer Motion.
- **Backend**: Node.js, Express, Prisma ORM, PostgreSQL.
- **Blockchain**: Stellar Network (Testnet), `@stellar/stellar-sdk`.
- **Security**: AES-256 for vote encryption, Bcrypt for credential hashing, JWT for session management.

## Core Components

### 1. Identity & Registration
Voters register with their name, email, and Stellar wallet address. The system uses a two-step verification process (OTP via email) to ensure identity before allowing slot booking.

### 2. Time-Slot Management
To prevent congestion and ensure orderly voting, the system implements a 30-minute time-slot booking mechanism. Voters can only log in to cast their vote during their assigned window.

### 3. On-Chain Audit Trail
Every major action in the system is logged to the Stellar Testnet:
- Voter Registration
- OTP Verification
- Slot Booking
- Successful Login
- Vote Casting

These events are recorded using Stellar's `ManageData` operation. To ensure a seamless user experience, ElectChain implements **Fee Sponsorship (Fee Bump Transactions)**, allowing the platform to cover transaction fees for all voters (gasless voting).

### 4. Privacy-Preserving Voting
Votes are encrypted in the browser using AES-256 before being sent to the server. The server stores the encrypted payload and the transaction hash, but never has access to the plain-text choice.

## Data Flow
1. **User** -> Register -> **Backend** -> Create User (DB) -> Log to Stellar (Audit).
2. **User** -> Verify OTP -> **Backend** -> Validate -> Log to Stellar (Audit).
3. **User** -> Book Slot -> **Backend** -> Update Slot (DB) -> Log to Stellar (Audit).
4. **User** -> Login -> **Backend** -> Verify Credentials -> Log to Stellar (Audit) -> Return JWT.
5. **User** -> Cast Vote -> **Browser** -> Encrypt Choice -> **Backend** -> Store Encrypted Vote (DB) -> Log to Stellar (Audit).

## Security Measures
- **Rate Limiting**: Protection against brute-force OTP and login attempts.
- **Input Validation**: Strict schema validation using Joi.
- **Immutable Ledger**: Proof-of-existence for every election milestone on the Stellar blockchain.
- **One-Time Credentials**: Voting credentials expire immediately after use.
