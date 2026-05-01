// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title AuditLog
 * @dev Immutable audit trail for all critical election events
 */
contract AuditLog {
    struct AuditEvent {
        uint256 timestamp;
        string eventType;
        bytes32 eventHash;
        address actor;
    }
    
    AuditEvent[] public events;
    address public admin;
    
    mapping(bytes32 => uint256[]) public eventsByVoterHash;
    
    event LogEntryCreated(
        uint256 indexed eventIndex,
        string indexed eventType,
        bytes32 eventHash
    );
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this");
        _;
    }
    
    constructor() {
        admin = msg.sender;
    }
    
    /**
     * @dev Log a critical election event
     * @param eventType Type of event (e.g., "VOTER_REGISTERED", "VOTE_CAST")
     * @param eventHash Hash of event details
     * @param voterHash Hash of associated voter (if applicable)
     */
    function logEvent(
        string calldata eventType,
        bytes32 eventHash,
        bytes32 voterHash
    ) external onlyAdmin {
        uint256 eventIndex = events.length;
        
        AuditEvent memory newEvent = AuditEvent({
            timestamp: block.timestamp,
            eventType: eventType,
            eventHash: eventHash,
            actor: msg.sender
        });
        
        events.push(newEvent);
        
        if (voterHash != bytes32(0)) {
            eventsByVoterHash[voterHash].push(eventIndex);
        }
        
        emit LogEntryCreated(eventIndex, eventType, eventHash);
    }
    
    /**
     * @dev Get total number of events
     */
    function getEventCount() external view returns (uint256) {
        return events.length;
    }
    
    /**
     * @dev Get event by index
     * @param index Event index
     */
    function getEvent(uint256 index) external view returns (AuditEvent memory) {
        require(index < events.length, "Event index out of bounds");
        return events[index];
    }
    
    /**
     * @dev Get all events for a voter
     * @param voterHash Hash of voter identity
     */
    function getVoterEvents(bytes32 voterHash) external view returns (uint256[] memory) {
        return eventsByVoterHash[voterHash];
    }
    
    /**
     * @dev Get events in range (for pagination)
     * @param startIdx Start index
     * @param count Number of events to return
     */
    function getEventsRange(uint256 startIdx, uint256 count) 
        external 
        view 
        returns (AuditEvent[] memory) 
    {
        require(startIdx < events.length, "Invalid start index");
        
        uint256 endIdx = startIdx + count;
        if (endIdx > events.length) {
            endIdx = events.length;
        }
        
        AuditEvent[] memory result = new AuditEvent[](endIdx - startIdx);
        for (uint256 i = startIdx; i < endIdx; i++) {
            result[i - startIdx] = events[i];
        }
        
        return result;
    }
}
