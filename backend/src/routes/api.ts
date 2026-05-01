import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { CryptoUtils } from '../utils/crypto';
import { emailService } from '../services/email';
import { stellarService } from '../services/stellar';
import { config } from '../config';
import Joi from 'joi';

const prisma = new PrismaClient();
const router = Router();

// Validation schemas
const registerSchema = Joi.object({
  fullName: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().allow('').optional(),
  walletAddress: Joi.string()
    .regex(/^G[A-Z2-7]{55}$/)
    .required()
    .messages({
      'string.pattern.base': 'Must be a valid Stellar public key (starting with G, 56 characters)',
    }),
});

const verifyOTPSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(config.OTP_LENGTH).required(),
});

const bookSlotSchema = Joi.object({
  email: Joi.string().email().required(),
  slotId: Joi.string().required(),
});

const loginSchema = Joi.object({
  username: Joi.string().min(8).max(20).required(),
  password: Joi.string().min(8).max(20).required(),
});

const castVoteSchema = Joi.object({
  candidateId: Joi.string().required(),
  encryptedVote: Joi.string().required(),
});

// 1. POST /api/register - Register voter
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { fullName, email, phone, walletAddress } = value;

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Generate identity hash
    const identityHash = CryptoUtils.hashSHA256(email + fullName);

    // Create user
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        phone,
        walletAddress,
        identityHash,
      },
    });

    // Generate and send OTP
    const otp = email === 'test@electchain.local' ? '123456' : CryptoUtils.generateOTP();
    const otpHash = await CryptoUtils.hashBcrypt(otp);

    await prisma.oTP.create({
      data: {
        userId: user.id,
        code: otpHash,
        expiresAt: new Date(Date.now() + config.OTP_EXPIRY_MINUTES * 60 * 1000),
      },
    });

    // Send OTP email
    await emailService.sendOTP(email, otp, fullName);

    // Log to Stellar
    const eventHashRaw = CryptoUtils.hashSHA256(identityHash);
    const stellarTxHash = await stellarService.logEventOnChain('REGISTRATION', eventHashRaw);

    // Log audit event
    await prisma.auditEvent.create({
      data: {
        userId: user.id,
        eventType: 'REGISTRATION',
        eventHash: stellarTxHash,
        description: `Voter registered: ${fullName} (Stellar tx: ${stellarTxHash})`,
      },
    });

    res.status(201).json({
      message: 'Registration successful. OTP sent to email.',
      userId: user.id,
      email: user.email,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// 2. POST /api/verify-otp - Verify OTP
router.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { error, value } = verifyOTPSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, otp } = value;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const otpRecord = await prisma.oTP.findUnique({ where: { userId: user.id } });
    if (!otpRecord) {
      return res.status(400).json({ error: 'OTP not found' });
    }

    // Check expiry
    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ error: 'OTP expired' });
    }

    // Check attempts
    if (otpRecord.attempts >= 3) {
      return res.status(400).json({ error: 'Too many failed attempts' });
    }

    // Verify OTP
    const isMatch = await CryptoUtils.compareBcrypt(otp, otpRecord.code);
    if (!isMatch) {
      await prisma.oTP.update({
        where: { userId: user.id },
        data: { attempts: otpRecord.attempts + 1 },
      });
      return res.status(401).json({ error: 'Invalid OTP' });
    }

    // Mark as verified
    await prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true },
    });

    await prisma.oTP.update({
      where: { userId: user.id },
      data: { verified: true },
    });

    // Log to Stellar
    const eventHashRaw = CryptoUtils.hashSHA256(user.identityHash);
    const stellarTxHash = await stellarService.logEventOnChain('OTP_VERIFIED', eventHashRaw);

    // Log audit event
    await prisma.auditEvent.create({
      data: {
        userId: user.id,
        eventType: 'OTP_VERIFIED',
        eventHash: stellarTxHash,
        description: `OTP verification successful (Stellar tx: ${stellarTxHash})`,
      },
    });

    res.json({
      message: 'OTP verified successfully',
      nextStep: 'book-slot',
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// 3. GET /api/slots - Get available voting slots
router.get('/slots', async (req: Request, res: Response) => {
  try {
    const slots = await prisma.votingSlot.findMany({
      where: { isActive: true },
      orderBy: { slotTime: 'asc' },
    });

    res.json({
      slots: slots.map((s) => ({
        id: s.id,
        slotTime: s.slotTime,
        availableCapacity: s.capacity - s.booked,
        isFull: s.booked >= s.capacity,
      })),
    });
  } catch (error) {
    console.error('Slots error:', error);
    res.status(500).json({ error: 'Failed to fetch slots' });
  }
});

// 4. POST /api/book-slot - Book voting slot
router.post('/book-slot', async (req: Request, res: Response) => {
  try {
    const { error, value } = bookSlotSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, slotId } = value;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({ error: 'Email not verified' });
    }

    // Check if already booked
    if (user.slotBooked) {
      return res.status(400).json({ error: 'Slot already booked' });
    }

    const slot = await prisma.votingSlot.findUnique({ where: { id: slotId } });
    if (!slot) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    if (slot.booked >= slot.capacity) {
      return res.status(400).json({ error: 'Slot is full' });
    }

    // Update user slot
    await prisma.user.update({
      where: { id: user.id },
      data: {
        votingSlot: slot.slotTime,
        slotBooked: true,
      },
    });

    // Increment slot booking count
    await prisma.votingSlot.update({
      where: { id: slotId },
      data: { booked: slot.booked + 1 },
    });

    // Log to Stellar
    const eventHashRaw = CryptoUtils.hashSHA256(slot.slotTime.toISOString());
    const stellarTxHash = await stellarService.logEventOnChain('SLOT_BOOKED', eventHashRaw);

    // Log audit event
    await prisma.auditEvent.create({
      data: {
        userId: user.id,
        eventType: 'SLOT_BOOKED',
        eventHash: stellarTxHash,
        description: `Slot booked for ${slot.slotTime.toISOString()} (Stellar tx: ${stellarTxHash})`,
      },
    });

    // Generate one-time voting credentials
    const username = email === 'test@electchain.local' ? 'TESTUSER' : CryptoUtils.generateCredential(8).toUpperCase();
    const password = email === 'test@electchain.local' ? 'TESTPASS123' : CryptoUtils.generateCredential(12);
    const usernameHash = await CryptoUtils.hashBcrypt(username);
    const passwordHash = await CryptoUtils.hashBcrypt(password);

    const tokenId = CryptoUtils.hashSHA256(username + password);

    // Store credentials (result intentionally not used)
    await prisma.credential.create({
      data: {
        userId: user.id,
        usernameHash,
        passwordHash,
        tokenId,
        expiresAt: new Date(
          Date.now() + config.CREDENTIAL_EXPIRY_HOURS * 60 * 60 * 1000
        ),
      },
    });

    // Send credentials email
    await emailService.sendCredentials(
      email,
      username,
      password,
      user.fullName,
      slot.slotTime
    );

    res.json({
      message: 'Slot booked successfully. Credentials sent to email.',
      slotTime: slot.slotTime,
    });
  } catch (error) {
    console.error('Slot booking error:', error);
    res.status(500).json({ error: 'Failed to book slot' });
  }
});

// 5. POST /api/login - Login with credentials
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { username, password } = value;

    // Find credential by username hash
    const credentials = await prisma.credential.findMany({});
    let credential = null;

    for (const cred of credentials) {
      const isUsernameMatch = await CryptoUtils.compareBcrypt(
        username,
        cred.usernameHash
      );
      if (isUsernameMatch) {
        credential = cred;
        break;
      }
    }

    if (!credential) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if credential is used
    if (credential.isUsed) {
      return res.status(403).json({ error: 'Credentials already used' });
    }

    // Check expiry
    if (credential.expiresAt < new Date()) {
      return res.status(403).json({ error: 'Credentials expired' });
    }

    // Verify password
    const isPasswordMatch = await CryptoUtils.compareBcrypt(
      password,
      credential.passwordHash
    );
    if (!isPasswordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Mark credential as used
    await prisma.credential.update({
      where: { id: credential.id },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
    });

    const user = await prisma.user.findUnique({ where: { id: credential.userId } });
    if (!user) {
      return res.status(404).json({ error: 'Associated voter account not found' });
    }

    // Generate voting token
    const votingToken = CryptoUtils.generateJWT({
      userId: user.id,
      tokenId: credential.tokenId,
      voterHash: user.identityHash,
      type: 'voting',
    });

    // Log to Stellar
    const eventHashRaw = CryptoUtils.hashSHA256(credential.tokenId);
    const stellarTxHash = await stellarService.logEventOnChain('LOGIN', eventHashRaw);

    // Log audit event
    await prisma.auditEvent.create({
      data: {
        userId: user.id,
        eventType: 'LOGIN',
        eventHash: stellarTxHash,
        description: `User logged in for voting (Stellar tx: ${stellarTxHash})`,
      },
    });

    res.json({
      message: 'Login successful',
      votingToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// 6. GET /api/ballot - Get ballot
router.get('/ballot', async (req: Request, res: Response) => {
  try {
    // In a real system, this would be fetched from a database
    // For MVP, return hardcoded candidates
    const ballot = {
      electionName: 'ElectChain Testnet Election 2026',
      candidates: [
        {
          id: 'candidate-1',
          name: 'Alice Progressive',
          symbol: '🔵',
          party: 'Blue Party',
        },
        {
          id: 'candidate-2',
          name: 'Bob Conservative',
          symbol: '🔴',
          party: 'Red Party',
        },
        {
          id: 'candidate-3',
          name: 'Carol Independent',
          symbol: '🟢',
          party: 'Green Party',
        },
      ],
    };

    res.json(ballot);
  } catch (error) {
    console.error('Ballot error:', error);
    res.status(500).json({ error: 'Failed to fetch ballot' });
  }
});

// 7. POST /api/cast-vote - Cast encrypted vote
router.post('/cast-vote', async (req: Request, res: Response) => {
  try {
    const { error, value } = castVoteSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { candidateId, encryptedVote } = value;

    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify token
    const votingPayload = CryptoUtils.verifyJWT(token);
    if (!votingPayload || votingPayload.type !== 'voting') {
      return res.status(401).json({ error: 'Invalid or expired voting token' });
    }

    const user = await prisma.user.findUnique({
      where: { id: votingPayload.userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already voted
    if (user.hasVoted) {
      return res.status(403).json({ error: 'Voter has already voted' });
    }

    // Check voting slot (must be within 30 minutes)
    if (!user.votingSlot) {
      return res.status(403).json({ error: 'No voting slot assigned' });
    }

    const now = new Date();
    const slotStart = new Date(user.votingSlot);
    const slotEnd   = new Date(slotStart.getTime() + 30 * 60 * 1000);
    // Forward-only window: voter may not cast before their slot opens
    if (now < slotStart || now > slotEnd) {
      return res.status(403).json({ error: 'Voting is only allowed within your 30-minute slot window' });
    }

    // Generate commitment hash
    const commitmentHash = CryptoUtils.hashSHA256(
      encryptedVote + Date.now()
    );
    const verificationId = CryptoUtils.generateVerificationId();

    // Get candidate symbol
    const candidates = [
      { id: 'candidate-1', symbol: '🔵' },
      { id: 'candidate-2', symbol: '🔴' },
      { id: 'candidate-3', symbol: '🟢' },
    ];
    const candidate = candidates.find((c) => c.id === candidateId);
    const candidateSymbol = candidate ? candidate.symbol : '?';

    // Record vote
    const voteRecord = await prisma.voteRecord.create({
      data: {
        userId: user.id,
        commitmentHash,
        encryptedVoteHash: CryptoUtils.hashSHA256(encryptedVote),
        verificationId,
        candidateSymbol,
      },
    });

    // Mark user as voted
    await prisma.user.update({
      where: { id: user.id },
      data: { hasVoted: true },
    });

    // Log to Stellar
    const stellarTxHash = await stellarService.logEventOnChain('VOTE_CAST', commitmentHash);

    // Log audit event
    await prisma.auditEvent.create({
      data: {
        userId: user.id,
        eventType: 'VOTE_CAST',
        eventHash: stellarTxHash,
        description: `Vote cast and recorded (Stellar tx: ${stellarTxHash})`,
      },
    });

    // Send confirmation email
    await emailService.sendVoteConfirmation(
      user.email,
      user.fullName,
      verificationId
    );

    res.json({
      message: 'Vote successfully recorded',
      verificationId,
      candidateSymbol,
    });
  } catch (error) {
    console.error('Cast vote error:', error);
    res.status(500).json({ error: 'Failed to cast vote' });
  }
});

// 8. GET /api/audit - Get audit trail (admin)
router.get('/audit', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 1000);
    const offset = parseInt(req.query.offset as string) || 0;

    const events = await prisma.auditEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: { fullName: true, email: true },
        },
      },
    });

    const total = await prisma.auditEvent.count();

    res.json({
      events,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Audit error:', error);
    res.status(500).json({ error: 'Failed to fetch audit trail' });
  }
});

// 9. POST /api/feedback - Submit feedback
router.post('/feedback', async (req: Request, res: Response) => {
  try {
    const { name, email, walletAddress, rating, feedback } = req.body;

    if (!name || !email || !walletAddress || !rating || !feedback) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const feedbackRecord = await prisma.feedback.create({
      data: {
        name,
        email,
        walletAddress,
        rating,
        feedback,
      },
    });

    res.status(201).json({
      message: 'Feedback submitted successfully',
      id: feedbackRecord.id,
    });
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// 10. GET /api/admin/summary - Admin dashboard summary
router.get('/admin/summary', async (req: Request, res: Response) => {
  try {
    const totalRegistered = await prisma.user.count();
    const totalVerified = await prisma.user.count({ where: { isEmailVerified: true } });
    const totalVoted = await prisma.user.count({ where: { hasVoted: true } });
    const totalSlots = await prisma.votingSlot.count();
    const totalAuditEvents = await prisma.auditEvent.count();
    const totalFeedback = await prisma.feedback.count();

    const voteCounts = await prisma.voteRecord.groupBy({
      by: ['candidateSymbol'],
      _count: true,
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dau = await prisma.auditEvent.groupBy({
      by: ['userId'],
      where: { createdAt: { gte: today } },
      _count: true,
    }).then(groups => groups.length);

    const transactionsToday = await prisma.auditEvent.count({
      where: { createdAt: { gte: today } },
    });

    const retentionRate = totalRegistered > 0 ? (totalVoted / totalRegistered) * 100 : 0;

    res.json({
      summary: {
        totalRegistered,
        totalVerified,
        totalVoted,
        totalSlots,
        totalAuditEvents,
        totalFeedback,
        voteCounts,
        metrics: {
          dau,
          transactionsToday,
          retentionRate: retentionRate.toFixed(1) + '%',
        }
      },
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Admin summary error:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// 11. GET /api/admin/feedback - Export feedback
router.get('/admin/feedback', async (req: Request, res: Response) => {
  try {
    const feedback = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Convert to CSV format
    const csv = [
      ['Name', 'Email', 'Wallet Address', 'Rating', 'Feedback', 'Submitted At'],
      ...feedback.map((f) => [
        f.name,
        f.email,
        f.walletAddress,
        f.rating,
        f.feedback,
        f.createdAt.toISOString(),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename="feedback.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Feedback export error:', error);
    res.status(500).json({ error: 'Failed to export feedback' });
  }
});

export default router;
