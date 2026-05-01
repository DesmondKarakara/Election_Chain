import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying CivicChain contracts...");

  // Deploy VoterRegistry
  const VoterRegistry = await ethers.getContractFactory("VoterRegistry");
  const voterRegistry = await VoterRegistry.deploy();
  await voterRegistry.waitForDeployment();
  console.log(`✓ VoterRegistry deployed: ${await voterRegistry.getAddress()}`);

  // Deploy VotingSession
  const VotingSession = await ethers.getContractFactory("VotingSession");
  const votingSession = await VotingSession.deploy();
  await votingSession.waitForDeployment();
  console.log(`✓ VotingSession deployed: ${await votingSession.getAddress()}`);

  // Deploy BallotCommitment
  const BallotCommitment = await ethers.getContractFactory("BallotCommitment");
  const ballotCommitment = await BallotCommitment.deploy();
  await ballotCommitment.waitForDeployment();
  console.log(`✓ BallotCommitment deployed: ${await ballotCommitment.getAddress()}`);

  // Deploy AuditLog
  const AuditLog = await ethers.getContractFactory("AuditLog");
  const auditLog = await AuditLog.deploy();
  await auditLog.waitForDeployment();
  console.log(`✓ AuditLog deployed: ${await auditLog.getAddress()}`);

  // Save addresses
  console.log("\n✓ All contracts deployed successfully!");
  console.log("\nUpdate your .env with these addresses:");
  console.log(`VOTER_REGISTRY_ADDRESS=${await voterRegistry.getAddress()}`);
  console.log(`VOTING_SESSION_ADDRESS=${await votingSession.getAddress()}`);
  console.log(`BALLOT_COMMITMENT_ADDRESS=${await ballotCommitment.getAddress()}`);
  console.log(`AUDIT_LOG_ADDRESS=${await auditLog.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
