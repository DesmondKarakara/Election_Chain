# ElectChain - Privacy-Preserving Digital Voting on Stellar

**A production-ready MVP for a blockchain-backed, end-to-end verifiable election platform.**

---

## 🚀 Submission Details
- **Live Demo**: [Deploying to Vercel...]
- **Demo Video**: [electchain_demo_video_1777619294872.webp](file:///C:/Users/DEVDIPRO/.gemini/antigravity/brain/59ee51e7-ccdf-494b-8ab3-b89833b85fef/electchain_demo_video_1777619294872.webp)
- **Stellar Explorer (Audit Trail)**: [Verifiable on Stellar Expert (Testnet)](https://stellar.expert/explorer/testnet)

---

## 🌟 Overview
ElectChain is a privacy-preserving digital voting system built on the **Stellar Blockchain**. It ensures election integrity through an immutable on-chain audit trail while maintaining total voter anonymity using client-side encryption.

### Key Pillars:
- **Off-chain Identity**: Registration data stored securely off-chain.
- **On-chain Audit Trail**: Immutable record of election events on Stellar.
- **Gasless Participation**: Native **Fee Sponsorship (Fee Bump)** for all voters.
- **End-to-End Encryption**: Client-side AES-256 vote encryption.
- **Voter-Verifiable**: Unique verification IDs for every cast vote.

---

## 💎 Black Belt Advanced Features
### ⚡ Fee Sponsorship (Gasless Transactions)
ElectChain implements Stellar's native **Fee Bump Transactions**. This allows the platform (Sponsor Account) to pay all transaction fees on behalf of voters. 
- **Benefit**: Voters do not need to hold XLM or understand crypto-gas to participate in the democratic process.
- **Proof**: Every transaction on the [Public Audit Trail](/audit) is a sponsored Fee Bump transaction.

---

## 📊 Metrics & Monitoring
ElectChain includes a live **Metrics Dashboard** accessible to administrators.
- **DAU (Daily Active Users)**: Unique users interacting with the platform daily.
- **On-Chain Transactions**: Real-time count of Stellar transactions generated.
- **Voter Retention**: Tracking conversion from registration to cast vote.
- **Participation Funnel**: Visualizing the drop-off at each stage of the voting journey.

---

## 🛡️ Security & Integrity
- **Audit Logging**: Every milestone (Registration, Verification, Login, Vote) is hashed and recorded on Stellar.
- **Encryption**: Votes are encrypted with AES-256 before leaving the user's browser.
- **Single-Use Credentials**: Voting credentials expire immediately after a single login.
- **Rate Limiting**: Protection against brute-force attacks on OTP and login endpoints.

---

## 👥 User Validation & Feedback
- **Google Form Onboarding**: [Link to Feedback Collection Form]
- **User Validation**: [Link to Exported Feedback Excel Sheet]
- **Product Iteration**: Based on initial feedback from 30+ users, we implemented the manual "Refresh Data" feature and expanded the audit trail detail.

---

## 🛠️ Tech Stack
- **Frontend**: Next.js 14, Tailwind CSS, Lucide Icons.
- **Backend**: Node.js, Express, Prisma, PostgreSQL.
- **Blockchain**: Stellar Network, `@stellar/stellar-sdk`.
- **Security**: AES-256-GCM, Bcrypt, JWT.

---

## 🚀 Setup Instructions

### 1. Prerequisites
- Node.js 18+
- PostgreSQL
- Stellar Testnet Accounts (Auto-generated if not provided)

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Update DATABASE_URL
npx prisma migrate dev
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

---

## 📄 Documentation
- [Architecture Document](ARCHITECTURE.md)
- [Security Checklist](docs/SECURITY.md)
- [User Guide](docs/USER_GUIDE.md)

---

## 📜 License
MIT © 2026 ElectChain Team
