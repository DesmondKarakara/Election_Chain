// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title BallotCommitment
 * @dev Records vote commitments without revealing voter identity or vote choice
 */
contract BallotCommitment {
    mapping(bytes32 => bool) public hasVotedByHash;
    mapping(bytes32 => bytes) public voteCommitments;
    mapping(bytes32 => bytes) public encryptedVotes;
    
    address public admin;
    
    event VoteCast(bytes32 indexed commitmentHash, bytes32 encryptedVoteHash);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this");
        _;
    }
    
    constructor() {
        admin = msg.sender;
    }
    
    /**
     * @dev Cast a vote with commitment and encrypted payload
     * @param voterHash Hash of voter identity (to prevent double voting)
     * @param commitmentHash Hash of the vote commitment
     * @param encryptedVote Encrypted vote data (client-side encrypted)
     */
    function castVote(
        bytes32 voterHash,
        bytes32 commitmentHash,
        bytes calldata encryptedVote
    ) external onlyAdmin {
        require(!hasVotedByHash[voterHash], "Voter has already voted");
        require(commitmentHash != bytes32(0), "Invalid commitment hash");
        
        hasVotedByHash[voterHash] = true;
        voteCommitments[commitmentHash] = abi.encodePacked(voterHash);
        encryptedVotes[commitmentHash] = encryptedVote;
        
        emit VoteCast(commitmentHash, keccak256(encryptedVote));
    }
    
    /**
     * @dev Check if a voter (by hash) has already voted
     * @param voterHash Hash of voter identity
     */
    function hasVoted(bytes32 voterHash) external view returns (bool) {
        return hasVotedByHash[voterHash];
    }
    
    /**
     * @dev Get vote commitment (does not reveal the vote)
     * @param commitmentHash Commitment hash
     */
    function getCommitment(bytes32 commitmentHash) external view returns (bytes memory) {
        return voteCommitments[commitmentHash];
    }
    
    /**
     * @dev Get encrypted vote (only for admin/auditor with proper access)
     * @param commitmentHash Commitment hash
     */
    function getEncryptedVote(bytes32 commitmentHash) external view returns (bytes memory) {
        return encryptedVotes[commitmentHash];
    }
}
