// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";

contract GuessNumber {
    bool isConcluded;
    address host;
    bytes32 public nonceHash;
    bytes32 public nonceNumHash;
    uint hostDeposit;
    uint numOfPlayers;
    struct Guess {
        address player;
        uint16 number;
    }
    Guess[] guesses;
    mapping(address => bool) isSubmitted;
    event GuessLog(address player, uint16 number);

    constructor(
        bytes32 _nonceHash,
        bytes32 _nonceNumHash,
        uint _numOfPlayers
    ) payable {
        require(msg.value > 0, "Have to deposit some ether");
        require(_numOfPlayers > 1, "Should have 2 players at least");
        hostDeposit = msg.value;
        host = msg.sender;
        nonceHash = _nonceHash;
        nonceNumHash = _nonceNumHash;
        numOfPlayers = _numOfPlayers;
    }

    function guess(uint16 number) external payable {
        require(
            number >= 0 && number < 1000,
            "The range of this number should be [0, 1000)"
        );
        require(msg.sender != host, "host can not guess");
        require(
            msg.value == hostDeposit,
            "should send the same ether value as the host deposited"
        );
        require(
            !isSubmitted[msg.sender],
            "You have submitted a guessing already"
        );
        require(!isConcluded, "The game has already concluded");
        require(
            guesses.length < numOfPlayers,
            "Have reached the maximum number of players"
        );

        if (guesses.length != 0) {
            bool isGuessed = false;
            for (uint i = 0; i < guesses.length; i++) {
                if (guesses[i].number == number) {
                    isGuessed = true;
                    break;
                }
            }
            require(!isGuessed, "This number has been guessed by others");
        }
        isSubmitted[msg.sender] = true;
        guesses.push(Guess(msg.sender, number));
        emit GuessLog(msg.sender, number);
    }

    function reveal(bytes32 nonce, uint16 number) external {
        require(msg.sender == host, "only host can reveal");
        require(
            keccak256(abi.encodePacked(nonce)) == nonceHash,
            "nonceHash does not match"
        );
        require(
            _getNonceNumHash2(nonce, number) == nonceNumHash,
            "nonceNumHash does not match"
        );
        require(!isConcluded, "The game has already concluded");
        require(guesses.length == numOfPlayers, "Not all players have guessed");

        isConcluded = true;

        uint rewards = hostDeposit * (numOfPlayers + 1);
        if (number >= 1000) {
            uint reward = rewards / numOfPlayers;
            for (uint i = 0; i < guesses.length; i++) {
                payable(guesses[i].player).transfer(reward);
            }
        } else {
            address[] memory winners = _getWinners(guesses, number);
            // console.log("winners length", winners.length);
            // console.log("winner0 address:", winners[0]);

            if (winners.length == 1) {
                payable(winners[0]).transfer(rewards);
            } else {
                uint reward = rewards / 2; // only two winners at most
                payable(winners[0]).transfer(reward);
                payable(winners[1]).transfer(reward);
            }
        }
    }

    // helper funtion for testing
    function getGuesses() external view returns (Guess[] memory) {
        return guesses;
    }

    function _getWinners(Guess[] memory _guesses, uint16 _number)
        private
        pure
        returns (address[] memory)
    {
        address winner0;
        address winner1;
        uint16 minDiff = _getDiff(_guesses[0].number, _number);
        winner0 = _guesses[0].player;
        for (uint i = 1; i < _guesses.length; i++) {
            uint16 diff = _getDiff(_guesses[i].number, _number);
            if (diff < minDiff) {
                winner0 = _guesses[i].player;
                delete winner1;
                continue;
            }
            if (diff == minDiff) {
                winner1 = _guesses[i].player;
            }
        }
        if (winner1 == address(0)) {
            address[] memory winners = new address[](1);
            winners[0] = winner0;
            return winners;
        } else {
            address[] memory winners = new address[](2);
            winners[0] = winner0;
            winners[1] = winner1;
            return winners;
        }
    }

    function _getDiff(uint16 a, uint16 b) private pure returns (uint16) {
        return a >= b ? a - b : b - a;
    }

    function _getNonceNumHash2(bytes32 nonce, uint16 number)
        public
        pure
        returns (bytes32)
    {
        bytes memory numBytes = bytes(Strings.toString(number));
        bytes memory resultBytes = abi.encodePacked(nonce);
        uint8 i = 0;
        while (i < 32 && resultBytes[i] != 0) {
            i++;
        }
        for (uint j = 0; j < numBytes.length && i < 32; j++) {
            resultBytes[i] = numBytes[j];
            i++;
        }
        return keccak256(resultBytes);
    }
}
