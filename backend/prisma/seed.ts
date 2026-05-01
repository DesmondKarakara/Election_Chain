import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.feedback.deleteMany({});
  await prisma.voteRecord.deleteMany({});
  await prisma.credential.deleteMany({});
  await prisma.oTP.deleteMany({});
  await prisma.auditEvent.deleteMany({});
  await prisma.votingSlot.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.admin.deleteMany({});

  // Create voting slots (every 30 minutes for 8 hours)
  const slots = [];
  const now = new Date();
  for (let i = 0; i < 16; i++) {
    const slotTime = new Date(now.getTime() + i * 30 * 60 * 1000);
    slots.push(
      await prisma.votingSlot.create({
        data: {
          slotTime,
          capacity: 1000,
        },
      })
    );
  }

  console.log(`Created ${slots.length} voting slots`);

  // Create admin user
  const hashedAdminPassword = await bcryptjs.hash('admin123', 10);
  const admin = await prisma.admin.create({
    data: {
      email: 'admin@civicchain.local',
      password: hashedAdminPassword,
      role: 'admin',
    },
  });

  console.log(`Created admin user: ${admin.email}`);

  // Create 5 sample test users
  const testUsers = [
    {
      fullName: 'Alice Johnson',
      email: 'alice@test.civicchain',
      phone: '+1-555-0001',
      walletAddress: '0x1111111111111111111111111111111111111111',
    },
    {
      fullName: 'Bob Smith',
      email: 'bob@test.civicchain',
      phone: '+1-555-0002',
      walletAddress: '0x2222222222222222222222222222222222222222',
    },
    {
      fullName: 'Carol Williams',
      email: 'carol@test.civicchain',
      phone: '+1-555-0003',
      walletAddress: '0x3333333333333333333333333333333333333333',
    },
    {
      fullName: 'David Brown',
      email: 'david@test.civicchain',
      phone: '+1-555-0004',
      walletAddress: '0x4444444444444444444444444444444444444444',
    },
    {
      fullName: 'Eve Davis',
      email: 'eve@test.civicchain',
      phone: '+1-555-0005',
      walletAddress: '0x5555555555555555555555555555555555555555',
    },
  ];

  for (const testUser of testUsers) {
    const identityHash = Buffer.from(
      testUser.email + testUser.fullName
    ).toString('hex');

    await prisma.user.create({
      data: {
        ...testUser,
        identityHash,
        isEmailVerified: true,
        isEligible: true,
      },
    });
  }

  console.log(`Created 5 test users`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
