// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title VoterRegistry
 * @dev Manages voter eligibility and registration on-chain
 * Note: Voter identity is stored off-chain only; only hashed commitment is stored on-chain
 */
contract VoterRegistry {
    mapping(bytes32 => bool) public registeredVoters;
    mapping(bytes32 => bool) public eligibleVoters;
    
    address public admin;
    
    event VoterRegistered(bytes32 indexed voterHash);
    event EligibilityMarked(bytes32 indexed voterHash);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this");
        _;
    }
    
    constructor() {
        admin = msg.sender;
    }
    
    /**
     * @dev Register a voter by their hash
     * @param voterHash Keccak256 hash of voter identity
     */
    function registerVoter(bytes32 voterHash) external onlyAdmin {
        require(!registeredVoters[voterHash], "Voter already registered");
        registeredVoters[voterHash] = true;
        emit VoterRegistered(voterHash);
    }
    
    /**
     * @dev Mark a voter as eligible
     * @param voterHash Keccak256 hash of voter identity
     */
    function markEligible(bytes32 voterHash) external onlyAdmin {
        require(registeredVoters[voterHash], "Voter not registered");
        eligibleVoters[voterHash] = true;
        emit EligibilityMarked(voterHash);
    }
    
    /**
     * @dev Check if voter is eligible
     * @param voterHash Keccak256 hash of voter identity
     */
    function verifyEligibility(bytes32 voterHash) external view returns (bool) {
        return eligibleVoters[voterHash];
    }
    
    /**
     * @dev Check if voter is registered
     * @param voterHash Keccak256 hash of voter identity
     */
    function isRegistered(bytes32 voterHash) external view returns (bool) {
        return registeredVoters[voterHash];
    }
}
