// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ScreeningRegistry {
    struct ScreeningEntry {
        bytes32 resumeHash;
        string verificationId;
        string applicationId;
        uint256 score;
        uint256 recordedAt;
        address recorder;
    }

    mapping(bytes32 => ScreeningEntry) private screenings;

    event ScreeningRecorded(
        bytes32 indexed resumeHash,
        string verificationId,
        string applicationId,
        uint256 score,
        uint256 recordedAt,
        address indexed recorder
    );

    function recordScreening(
        bytes32 resumeHash,
        string calldata verificationId,
        string calldata applicationId,
        uint256 score
    ) external {
        require(resumeHash != bytes32(0), "Invalid resume hash");
        require(bytes(verificationId).length > 0, "Verification ID required");
        require(bytes(applicationId).length > 0, "Application ID required");
        require(screenings[resumeHash].recordedAt == 0, "Screening already recorded");

        ScreeningEntry memory entry = ScreeningEntry({
            resumeHash: resumeHash,
            verificationId: verificationId,
            applicationId: applicationId,
            score: score,
            recordedAt: block.timestamp,
            recorder: msg.sender
        });

        screenings[resumeHash] = entry;

        emit ScreeningRecorded(
            resumeHash,
            verificationId,
            applicationId,
            score,
            block.timestamp,
            msg.sender
        );
    }

    function getScreening(bytes32 resumeHash)
        external
        view
        returns (
            bytes32 storedResumeHash,
            string memory verificationId,
            string memory applicationId,
            uint256 score,
            uint256 recordedAt,
            address recorder
        )
    {
        ScreeningEntry memory entry = screenings[resumeHash];
        require(entry.recordedAt != 0, "Screening not found");

        return (
            entry.resumeHash,
            entry.verificationId,
            entry.applicationId,
            entry.score,
            entry.recordedAt,
            entry.recorder
        );
    }
}
