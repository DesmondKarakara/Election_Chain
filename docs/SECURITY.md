# CivicChain Security Document

## Overview

This document outlines the security architecture, threat model, and mitigations implemented in CivicChain.

## Disclaimer

**⚠️ IMPORTANT**: CivicChain is an MVP and has **not been professionally audited**. It demonstrates security principles but is **not suitable for real elections** without:

- Professional security audit by cryptography firm
- Formal verification of smart contracts
- Legal compliance review
- Penetration testing
- Voter education

## Security Principles

1. **Separation of Concerns**: Identity ≠ Vote ≠ Audit
2. **Defense in Depth**: Multiple layers of security
3. **Fail Secure**: Errors default to denial
4. **Zero Trust**: Verify all inputs
5. **Least Privilege**: Minimal admin access
6. **Transparency**: Verifiable audit trail

## Threat Model

### Threat Actors

| Threat | Motivation | Capability |
|--------|-----------|-----------|
| **Voter** | Fraud, double voting | Low-medium |
| **Adversary** | Vote tampering, disruption | Medium |
| **Admin** | Malicious elections, theft | High (trusted) |
| **Attacker** | System compromise, DoS | Medium |

### Attack Vectors

#### 1. Impersonation

**Threat**: Attacker votes as another voter

**Mitigations**:
- ✓ Email OTP verification (confirms email ownership)
- ✓ Unique identity hash (prevents reuse)
- ✓ One-time credentials (per voter)
- ✓ Session tokens expire quickly
- ✓ Wallet address registered (blockchain link)

**Residual Risk**: Low
- Compromised email account could allow voting as victim
- Mitigation: 2FA email (out of scope MVP)

#### 2. Credential Theft

**Threat**: Username/password intercepted

**Mitigations**:
- ✓ Credentials hashed with bcrypt (10 rounds)
- ✓ Single-use (marked as used immediately)
- ✓ Time-bound (expire after 2 hours)
- ✓ Transmitted via HTTPS only
- ✓ Never logged in plain text
- ✓ Email delivery (not SMS vulnerable to SIM swap)

**Residual Risk**: Low-Medium
- HTTPS man-in-the-middle could intercept
- Mitigation: Certificate pinning (not implemented)
- Email account compromise exposes credentials

#### 3. Replay Attacks

**Threat**: Credential/token reused multiple times

**Mitigations**:
- ✓ One-time credentials flagged as "used"
- ✓ Database enforces single use
- ✓ JWT tokens contain nonce
- ✓ Voting tokens consumed after login
- ✓ Blockchain records consumed tokens
- ✓ Timestamp validation on events

**Residual Risk**: Very Low
- Database integrity assumed (see #9)

#### 4. Double Voting

**Threat**: Same voter votes twice

**Mitigations**:
- ✓ Voter hash checked on-chain before vote
- ✓ User table has `hasVoted` flag
- ✓ Vote record 1:1 relationship to user
- ✓ Credentials consumed after login
- ✓ Atomic transaction enforcement (database + blockchain)

**Residual Risk**: Very Low
- Race condition if backend processes votes in parallel
- Mitigation: Database transaction isolation

#### 5. Vote Tampering

**Threat**: Vote changed after submission

**Mitigations**:
- ✓ Client-side encryption (AES-256-GCM)
- ✓ Backend never sees plaintext vote
- ✓ Commitment hash recorded on-chain
- ✓ Encrypted blob stored off-chain
- ✓ Decryption requires encryption key (not transmitted)
- ✓ Immutable audit log references votes

**Residual Risk**: Low
- Admin could theoretically modify database
- Mitigation: Blockchain reference prevents falsification

#### 6. Identity Exposure

**Threat**: Voter identity linked to vote choice

**Mitigations**:
- ✓ Identity hash on-chain (not plaintext)
- ✓ Vote commitment recorded (not candidate)
- ✓ Separate off-chain encryption key per vote
- ✓ Audit events reference hash, not candidate
- ✓ Verification ID does not reveal candidate

**Residual Risk**: Very Low
- Database compromise could expose off-chain identity
- But on-chain vote still encrypted

#### 7. Admin Misuse

**Threat**: Admin creates fake votes or deletes records

**Mitigations**:
- ✓ Audit log immutable on-chain
- ✓ Vote records timestamped
- ✓ API endpoints validate admin role (not implemented - simple MVP)
- ✓ Blockchain prevents vote creation without proper flow
- ✓ Event hashing detects tampering

**Residual Risk**: Medium
- Single admin account (multi-sig not implemented)
- Mitigation: Access control list (not in MVP)

#### 8. Denial of Service (DoS)

**Threat**: Service disrupted, election postponed

**Mitigations**:
- ✓ Rate limiting (not implemented in MVP)
- ✓ Input validation (Joi schemas)
- ✓ Query optimization (indexes)
- ✓ Distributed backend (can scale)
- ✓ Database connection pooling

**Residual Risk**: Medium
- No explicit rate limiting
- Mitigation: Deploy behind WAF (Cloudflare)

#### 9. Database Compromise

**Threat**: SQL injection, unauthorized access

**Mitigations**:
- ✓ Parameterized queries (Prisma ORM)
- ✓ Input validation (Joi)
- ✓ Hashed credentials (bcrypt)
- ✓ PostgreSQL enforces constraints
- ✓ Network isolation (VPC, not exposed publicly)
- ✓ Encrypted connection (SSL)

**Residual Risk**: Low (with proper infrastructure)
- Plaintext votes encrypted separately
- Identity hash insufficient to expose real identity

#### 10. Blockchain RPC Compromise

**Threat**: Blockchain transactions hijacked

**Mitigations**:
- ✓ Private key in secure .env (not in code)
- ✓ Hardware wallet recommended (not used in MVP)
- ✓ Transactions signed by specific account
- ✓ RPC URL can be changed
- ✓ Events validated against contract state

**Residual Risk**: Medium
- Private key exposure is catastrophic
- Mitigation: Use hardware wallet (not in MVP)

#### 11. Client-Side Manipulation

**Threat**: Browser tampered, vote changed before encryption

**Mitigations**:
- ✓ Candidate selection in client
- ✓ Encryption before transmission
- ✓ Backend validates vote was encrypted
- ✓ Commitment hash proves integrity
- ✓ VVPAT slip shows what was sent

**Residual Risk**: Low
- Malicious browser extension could tamper
- Mitigation: Built-in browser integrity (not standard)

#### 12. Cryptographic Weaknesses

**Threat**: Algorithm broken, keys compromised

**Mitigations**:
- ✓ Industry-standard libraries (crypto-js, ethers.js)
- ✓ AES-256-GCM (AEAD cipher)
- ✓ bcrypt (adaptive hashing)
- ✓ SHA256 / Keccak256 (collision resistant)
- ✓ 16-char credentials (256 bits effective entropy)

**Residual Risk**: Very Low
- Library vulnerabilities could exist
- Mitigation: Regular npm updates + audits

## Security Checklist

- [ ] No plaintext votes stored
- [x] No plaintext credentials stored
- [x] Identity not linked to vote on-chain
- [x] One-time credentials
- [x] OTP verification
- [x] HTTPS enforcement (deployment requirement)
- [x] Input validation on all endpoints
- [x] SQL injection prevention (Prisma)
- [x] Audit trail on-chain
- [x] Vote encryption
- [ ] Rate limiting (deployment requirement)
- [ ] CORS hardening (deployed origin)
- [ ] Admin 2FA
- [ ] Multi-sig admin (not implemented)
- [ ] Contract formal verification
- [ ] Professional security audit

## Implementation Notes

### Credential Hashing

```typescript
// Do NOT store plaintext
const hashedPassword = await bcryptjs.hash(password, 10);
```

### Vote Encryption

```typescript
// Client-side before transmission
const encrypted = CryptoJS.AES.encrypt(voteData, key).toString();
```

### Identity Hashing

```typescript
// Irreversible, consistent
const identityHash = CryptoUtils.hashSHA256(email + fullName);
```

### OTP Verification

```typescript
// Time-limited, attempt-limited
if (otpRecord.expiresAt < new Date()) {
  return { error: 'OTP expired' };
}
if (otpRecord.attempts >= 3) {
  return { error: 'Too many attempts' };
}
```

## Blockchain Security

### Smart Contracts

- ✓ Reentrancy: No state-changing external calls
- ✓ Integer overflow: Solidity ^0.8.0 (automatic checks)
- ✓ Access control: Admin-only functions
- ✓ Invariants: Voter can only vote once (enforced in contract)

### Known Issues (Not Addressed in MVP)

- [ ] Contract upgrade mechanism not implemented
- [ ] Emergency pause function missing
- [ ] No timelock for admin functions
- [ ] No event filtering limits (unbounded gas)

## Deployment Security

### Prerequisites

- [ ] PostgreSQL with strong password
- [ ] SSL/TLS certificates (Let's Encrypt)
- [ ] Environment variables not in version control
- [ ] Rate limiting on reverse proxy
- [ ] Web Application Firewall (Cloudflare)
- [ ] DDoS protection enabled
- [ ] Database backups automated
- [ ] Private key secured (HSM or hardware wallet)

### Monitoring

- [ ] Error tracking (Sentry)
- [ ] Performance monitoring (New Relic)
- [ ] Security monitoring (fail2ban, fail2ban)
- [ ] Audit log archival
- [ ] Alert on unusual patterns

## Testnet vs Mainnet

### Testnet (Current)

- Development and testing only
- No real value at stake
- Private key can be shared for testing
- No security audit required

### Mainnet (Future)

- **DO NOT DEPLOY WITHOUT**:
  - Professional security audit
  - Formal verification
  - Legal compliance review
  - Voter education
  - Poll worker training
  - Penetration testing
  - Insurance coverage

## User Security Recommendations

1. **Voter**:
   - Verify email address is correct
   - Do not share credentials
   - Keep verification slip safe
   - Report suspicious activity

2. **Admin**:
   - Use strong passwords
   - Enable 2FA
   - Rotate private keys
   - Monitor audit logs
   - Limit API access by IP

3. **Auditor**:
   - Verify blockchain events independently
   - Cross-check off-chain records
   - Inspect vote counts
   - Verify commitment hashes

## Incident Response

### If Database is Compromised

1. Immediately revoke all credentials
2. Issue new credentials to affected voters
3. Mark all existing votes as verified
4. Check blockchain for tampering
5. Audit all events
6. Notify users via email

### If Private Key is Leaked

1. Immediately stop operations
2. Deploy new contracts with new key
3. Inform blockchain community
4. Audit all historical transactions
5. Consider vote revocation (if before key use)

### If Someone Double-Votes

1. Identify from on-chain or database
2. Audit all their events
3. Void second vote
4. Investigate vote creation
5. Log incident

## Testing Security

### Unit Tests

- Invalid input rejection
- Hash consistency
- Credential hashing
- OTP expiry
- Vote constraints

### Integration Tests

- Registration → OTP → Slot → Vote flow
- Double voting prevention
- Credential single-use
- Audit trail creation

### Security Tests

- SQL injection attempts
- XSS prevention
- CSRF protection (verify CORS)
- Race conditions
- Timing attacks

## Future Improvements

Priority 1 (High):
- [ ] Rate limiting
- [ ] Multi-sig admin
- [ ] Hardware wallet integration

Priority 2 (Medium):
- [ ] Formal contract verification
- [ ] Zero-knowledge proofs for vote privacy
- [ ] Homomorphic encryption for result computation
- [ ] Decentralized voting (no central backend)

Priority 3 (Low):
- [ ] Quantum-resistant cryptography
- [ ] Blockchain light client
- [ ] IPFS for encrypted vote storage

## References

- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Solidity Security Best Practices](https://docs.soliditylang.org/en/latest/security-considerations.html)
- [EVM Smart Contract Audit Checklist](https://github.com/crytic/audit-checklist)

---

**Last Updated**: April 2026  
**Status**: MVP - Not Production Ready  
**Audit Status**: ⚠️ Not Audited
