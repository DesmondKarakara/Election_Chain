# CivicChain Smart Contracts

Solidity contracts for the CivicChain voting platform.

## Overview

Four core contracts manage the voting lifecycle:

1. **VoterRegistry** - Register voters and track eligibility
2. **VotingSession** - Issue and manage voting tokens
3. **BallotCommitment** - Record vote commitments (not actual votes)
4. **AuditLog** - Immutable event logging

## Contracts

### VoterRegistry.sol

**Purpose**: Track voter eligibility on-chain

**Functions**:
- `registerVoter(bytes32 voterHash)` - Register a voter
- `markEligible(bytes32 voterHash)` - Mark voter as eligible
- `verifyEligibility(bytes32 voterHash) view` - Check eligibility
- `isRegistered(bytes32 voterHash) view` - Check registration

**Security**:
- Admin-only modifications
- Hash-based (no identity exposure)
- Events emitted for transparency

### VotingSession.sol

**Purpose**: Manage voting token lifecycle

**Functions**:
- `issueVotingToken(bytes32 tokenId, bytes32 voterHash)` - Issue token
- `consumeVotingToken(bytes32 tokenId)` - Mark as used
- `isTokenValid(bytes32 tokenId) view` - Check validity
- `getTokenVoterHash(bytes32 tokenId) view` - Get associated voter

**Security**:
- Tokens expire after 30 minutes
- Single-use enforcement
- No decryption of voter identity

### BallotCommitment.sol

**Purpose**: Record vote commitments without revealing votes

**Functions**:
- `castVote(bytes32 voterHash, bytes32 commitmentHash, bytes encryptedVote)` - Record vote
- `hasVoted(bytes32 voterHash) view` - Check if voted
- `getCommitment(bytes32 commitmentHash) view` - Get commitment
- `getEncryptedVote(bytes32 commitmentHash) view` - Get encrypted vote

**Security**:
- Double-voting prevented (per voterHash)
- Encrypted payload stored
- Commitment hash is public but non-reversible

### AuditLog.sol

**Purpose**: Immutable event logging

**Functions**:
- `logEvent(string eventType, bytes32 eventHash, bytes32 voterHash)` - Log event
- `getEventCount() view` - Get total events
- `getEvent(uint256 index) view` - Get event by index
- `getVoterEvents(bytes32 voterHash) view` - Get events for voter
- `getEventsRange(uint256 startIdx, uint256 count) view` - Get paginated events

**Security**:
- Immutable once logged
- Indexed by voter hash
- Time-ordered with timestamps

## Setup

```bash
npm install
npx hardhat compile
npx hardhat test
```

## Deployment

```bash
npx hardhat run scripts/deploy.ts --network testnet
```

The deploy script will output contract addresses. Add these to backend `.env`:

```
VOTER_REGISTRY_ADDRESS=0x...
VOTING_SESSION_ADDRESS=0x...
BALLOT_COMMITMENT_ADDRESS=0x...
AUDIT_LOG_ADDRESS=0x...
```

## Testing

```bash
npx hardhat test
```

## Gas Optimization

- Contracts use minimal state variables
- Events for off-chain indexing (not storage)
- View functions don't consume gas
- Array operations kept to minimum

## Security Considerations

### What's NOT on-chain

- Voter identity (plaintext or personal data)
- Vote choices (encrypted)
- User emails or phone numbers

### What IS on-chain

- Voter hash (irreversible)
- Vote commitment hash (non-reversible)
- Event hashes
- Token lifecycle

### Known Limitations (MVP)

- No contract upgradability
- No emergency pause mechanism
- Single admin account (centralized)
- No timelock on state changes

## Future Enhancements

- [ ] Proxy pattern for upgrades
- [ ] Multi-sig admin
- [ ] Formal verification
- [ ] Gas optimization
- [ ] Event filtering

---

See [ARCHITECTURE.md](../docs/ARCHITECTURE.md) for integration details.
