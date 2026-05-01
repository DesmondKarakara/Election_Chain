# CivicChain Test Plan

## Test Strategy

- **Unit Tests**: Individual functions and components
- **Integration Tests**: Full user flows
- **Security Tests**: Threat validations
- **Performance Tests**: Load and stress testing

## Test Scenarios

### 1. Voter Registration Flow

#### Test 1.1: Valid Registration

```
Scenario: User registers with valid data
Given: Fresh browser session
When: User fills registration form correctly
Then:
  - User record created
  - Identity hash generated
  - OTP sent (or logged in console)
  - Redirect to OTP verification
  - Audit event logged
```

#### Test 1.2: Duplicate Email

```
Scenario: User attempts to register with existing email
Given: alice@test.civicchain already registered
When: Another user enters alice@test.civicchain
Then:
  - Registration fails with "Email already registered"
  - No new user created
```

#### Test 1.3: Invalid Wallet Address

```
Scenario: User provides invalid wallet address
When: Wallet address is not 0x followed by 40 hex chars
Then:
  - Validation error displayed
  - Registration form not submitted
```

### 2. OTP Verification

#### Test 2.1: Valid OTP

```
Scenario: User enters correct OTP
When: User enters 6-digit code matching backend
Then:
  - OTP marked as verified
  - User redirected to slot booking
  - Email verification flag set
```

#### Test 2.2: Invalid OTP

```
Scenario: User enters wrong OTP
When: User enters incorrect 6-digit code
Then:
  - Error displayed
  - Attempt counter incremented
  - User not redirected
```

#### Test 2.3: OTP Expiry

```
Scenario: User attempts to verify expired OTP
When: OTP expires (10 minutes in production)
Then:
  - Error: "OTP expired"
  - User can request new OTP
```

#### Test 2.4: Max Attempts

```
Scenario: User exceeds 3 OTP attempts
When: User enters wrong code 3+ times
Then:
  - Error: "Too many failed attempts"
  - OTP locked
  - User must request new OTP
```

### 3. Slot Booking

#### Test 3.1: Available Slots Load

```
Scenario: Slots page loads
When: User navigates to /book-slot
Then:
  - All slots display with dates/times
  - Capacity shown
  - Full slots marked as unavailable
```

#### Test 3.2: Book Available Slot

```
Scenario: User books an available slot
When: User selects and books a slot with capacity
Then:
  - Slot capacity decremented
  - User assigned to slot
  - Credentials generated
  - Email sent with credentials
  - Redirect to login
```

#### Test 3.3: Book Full Slot

```
Scenario: User attempts to book full slot
When: User selects a slot with 0 capacity
Then:
  - Slot appears disabled
  - Cannot select
  - Error if attempted via API
```

#### Test 3.4: Prevent Re-Booking

```
Scenario: User with existing slot tries to book another
When: User already has votingSlot assigned
Then:
  - Cannot book new slot
  - Error: "Slot already booked"
```

### 4. Login & Authentication

#### Test 4.1: Valid Credentials Login

```
Scenario: User logs in with correct credentials
When: User enters username and password from email
Then:
  - Credentials verified
  - Voting token issued (JWT)
  - Token stored in localStorage
  - Redirect to ballot
```

#### Test 4.2: Invalid Credentials

```
Scenario: User enters wrong credentials
When: Username or password is incorrect
Then:
  - Error: "Invalid credentials"
  - No token issued
  - User not redirected
```

#### Test 4.3: Single-Use Credentials

```
Scenario: User attempts to login twice with same credentials
When: User logs in successfully once
Then:
  - Credentials marked as "used"
  - Second login attempt fails
  - Error: "Credentials already used"
```

#### Test 4.4: Expired Credentials

```
Scenario: User attempts to login with expired credentials
When: More than 2 hours have passed since credential issue
Then:
  - Error: "Credentials expired"
  - No token issued
```

### 5. Vote Casting

#### Test 5.1: View Ballot

```
Scenario: Logged-in user views ballot
When: User navigates to /ballot with valid token
Then:
  - Ballot displays with all candidates
  - Each candidate has symbol and party
  - No candidate pre-selected
```

#### Test 5.2: Select & Vote

```
Scenario: User selects candidate and votes
When:
  - User is within voting time slot
  - User selects one candidate
  - User submits vote
Then:
  - Vote encrypted client-side
  - Commitment hash created
  - Vote submitted to API
  - Response includes verification ID
  - Redirect to confirmation
  - User marked as voted
  - Audit event created
```

#### Test 5.3: Prevent Double Voting

```
Scenario: User attempts to vote twice
When: User tries to cast second vote
Then:
  - Error: "Voter has already voted"
  - Second vote rejected
  - No duplicate on-chain
```

#### Test 5.4: Vote Outside Time Slot

```
Scenario: User attempts to vote outside assigned slot
When: Current time is more than 30 minutes from slot time
Then:
  - Error: "Voting slot has expired"
  - Vote not accepted
```

#### Test 5.5: Vote Encryption Validation

```
Scenario: API receives vote
When: Backend processes cast-vote
Then:
  - Encrypted vote payload checked
  - Vote is non-empty
  - Commitment hash is valid
  - Vote stored as encrypted blob
  - Never stored plaintext
```

### 6. Confirmation Slip

#### Test 6.1: Display VVPAT Slip

```
Scenario: User sees confirmation after voting
When: Vote successfully recorded
Then:
  - Verification ID displayed (unique)
  - Candidate symbol shown (e.g., 🔵)
  - Timestamp recorded
  - Print option available
  - Email sent with link
```

#### Test 6.2: No Vote Choice Leak

```
Scenario: Verification ID is examined
When: Anyone has verification ID
Then:
  - Cannot determine what vote was cast
  - Only symbol shown
  - Identity not linkable
```

#### Test 6.3: Print Slip

```
Scenario: User prints VVPAT slip
When: User clicks print button
Then:
  - Print dialog opens
  - Slip formatted for printing
  - Sensitive data not leaked
```

### 7. Admin Dashboard

#### Test 7.1: Dashboard Stats

```
Scenario: Admin views dashboard
When: Admin navigates to /admin
Then:
  - Total registered users shown
  - Email verified count shown
  - Vote count shown
  - Turnout percentage calculated
  - Vote count by candidate shown
```

#### Test 7.2: Audit Trail Access

```
Scenario: Admin views audit trail
When: Admin clicks "View Audit Trail"
Then:
  - Paginated event list displays
  - Events: REGISTERED, OTP_VERIFIED, SLOT_BOOKED, VOTE_CAST
  - Timestamps and event hashes shown
  - Can filter by event type (future enhancement)
```

#### Test 7.3: Feedback Export

```
Scenario: Admin downloads feedback
When: Admin clicks "Download Feedback (CSV)"
Then:
  - CSV file generated
  - Columns: Name, Email, Wallet, Rating, Feedback, Timestamp
  - Can be imported to Excel/Sheets
```

### 8. Feedback Form

#### Test 8.1: Submit Feedback

```
Scenario: User submits feedback
When: User fills feedback form completely
Then:
  - Name, Email, Wallet, Rating, Feedback required
  - Rating validation (1-5)
  - Feedback stored in database
  - Success message shown
  - Email sent to user
```

#### Test 8.2: Feedback Validation

```
Scenario: User submits incomplete feedback
When: Any required field is missing
Then:
  - Validation error displayed
  - Form not submitted
```

### 9. Blockchain Integration

#### Test 9.1: Contract Deployment

```
Scenario: Smart contracts deployed
When: Running deployment script
Then:
  - VoterRegistry deployed
  - VotingSession deployed
  - BallotCommitment deployed
  - AuditLog deployed
  - All addresses returned
  - All ABIs loaded
```

#### Test 9.2: On-Chain Voter Registration

```
Scenario: Backend registers voter on-chain
When: User completes OTP verification
Then:
  - Voter hash registered in VoterRegistry
  - Transaction successful
  - Event emitted
  - Can verify eligibility
```

#### Test 9.3: On-Chain Token Issuance

```
Scenario: Backend issues voting token
When: User books slot
Then:
  - Token issued in VotingSession
  - Token valid for 30 minutes
  - Can consume token on vote
```

#### Test 9.4: On-Chain Vote Recording

```
Scenario: Backend records vote commitment
When: User casts vote
Then:
  - Commitment hash recorded in BallotCommitment
  - Voter hash marked as voted
  - Encrypted vote stored off-chain (reference on-chain)
  - Prevents double voting
```

#### Test 9.5: On-Chain Audit Events

```
Scenario: Backend logs events
When: Critical actions occur
Then:
  - Event logged to AuditLog
  - Event type recorded
  - Event hash recorded
  - Immutable on-chain
  - Queryable by voter or by type
```

### 10. Security Tests

#### Test 10.1: SQL Injection Prevention

```
Scenario: Malicious user attempts SQL injection
When: User enters ' OR '1'='1 in input fields
Then:
  - Input sanitized/parameterized
  - Error handled gracefully
  - No database compromise
```

#### Test 10.2: XSS Prevention

```
Scenario: User attempts XSS in feedback
When: User enters <script>alert('xss')</script>
Then:
  - Input escaped/sanitized
  - Script not executed
  - Stored as plain text
```

#### Test 10.3: CORS Validation

```
Scenario: Request from different origin
When: Frontend sends request from wrong origin
Then:
  - CORS policy enforced
  - Only allowed origins accepted
  - Unauthorized origins rejected
```

#### Test 10.4: JWT Token Validation

```
Scenario: User manipulates JWT token
When: Token payload modified
Then:
  - Token signature invalid
  - Request rejected
  - 401 Unauthorized
```

#### Test 10.5: Rate Limiting (Future)

```
Scenario: User makes rapid requests
When: Too many requests in short time
Then:
  - Request rate limited
  - 429 Too Many Requests
  - Exponential backoff applied
```

## Test Execution

### Manual Testing Checklist

```
□ Registration flow works end-to-end
□ OTP verification succeeds
□ Slot booking works
□ Credentials received via email/console
□ Login succeeds with credentials
□ Ballot displays correctly
□ Vote submission works
□ Confirmation slip shows
□ Admin dashboard loads
□ Audit trail shows events
□ Feedback form works
□ Double voting prevented
□ Credentials single-use enforced
□ Vote not visible to admin
□ Blockchain transactions recorded
□ Email delivery functional (or console)
```

### Automated Testing (Future)

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Load testing
npm run test:load
```

### Test Coverage Targets

- API Routes: 90%+
- Utils/Crypto: 95%+
- Services: 85%+
- Smart Contracts: 100%

## Performance Benchmarks

- Page load time: <3 seconds
- API response time: <500ms (p99)
- Vote submission: <2 seconds
- Blockchain transaction: <30 seconds (depending on network)

## Known Issues / Limitations

- OTP in development mode logs to console (not production-ready)
- No rate limiting implemented (add in production)
- No admin authentication implemented (simple MVP)
- Vote count by candidate not real-time (requires polling)

## Future Test Enhancements

- [ ] Selenium/Playwright E2E tests
- [ ] Jest unit tests
- [ ] Hardhat contract tests
- [ ] Load testing (k6)
- [ ] Security scanning (OWASP ZAP)
- [ ] Contract formal verification
- [ ] Chaos engineering tests

---

For automated testing setup, see test directories in each module.
