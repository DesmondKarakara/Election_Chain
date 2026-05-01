// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title VotingSession
 * @dev Manages voting tokens and session validation
 */
contract VotingSession {
    mapping(bytes32 => bool) public issuedTokens;
    mapping(bytes32 => bool) public consumedTokens;
    mapping(bytes32 => uint256) public tokenExpiry;
    mapping(bytes32 => bytes32) public tokenToVoterHash;
    
    address public admin;
    uint256 public tokenExpiryDuration = 30 minutes;
    
    event TokenIssued(bytes32 indexed tokenId, bytes32 indexed voterHash);
    event TokenConsumed(bytes32 indexed tokenId);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this");
        _;
    }
    
    constructor() {
        admin = msg.sender;
    }
    
    /**
     * @dev Issue a voting token for a voter in a specific slot
     * @param tokenId Unique token ID (hash of credentials)
     * @param voterHash Hash of voter identity
     */
    function issueVotingToken(bytes32 tokenId, bytes32 voterHash) external onlyAdmin {
        require(!issuedTokens[tokenId], "Token already issued");
        issuedTokens[tokenId] = true;
        tokenToVoterHash[tokenId] = voterHash;
        tokenExpiry[tokenId] = block.timestamp + tokenExpiryDuration;
        emit TokenIssued(tokenId, voterHash);
    }
    
    /**
     * @dev Consume a voting token (mark as used)
     * @param tokenId Token to consume
     */
    function consumeVotingToken(bytes32 tokenId) external onlyAdmin {
        require(issuedTokens[tokenId], "Token not issued");
        require(!consumedTokens[tokenId], "Token already consumed");
        require(block.timestamp <= tokenExpiry[tokenId], "Token expired");
        
        consumedTokens[tokenId] = true;
        emit TokenConsumed(tokenId);
    }
    
    /**
     * @dev Check if a token is valid (issued, not consumed, not expired)
     * @param tokenId Token to validate
     */
    function isTokenValid(bytes32 tokenId) external view returns (bool) {
        return issuedTokens[tokenId] && 
               !consumedTokens[tokenId] && 
               block.timestamp <= tokenExpiry[tokenId];
    }
    
    /**
     * @dev Get voter hash associated with token
     * @param tokenId Token ID
     */
    function getTokenVoterHash(bytes32 tokenId) external view returns (bytes32) {
        return tokenToVoterHash[tokenId];
    }
}
