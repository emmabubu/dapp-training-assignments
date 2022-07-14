import { ethers } from 'hardhat';
import { BigNumber, Signer } from 'ethers';
import { GuessNumber } from '../typechain-types';
import { expect } from 'chai';
const { keccak256, formatBytes32String } = ethers.utils;

async function deploy(
  nonce: string,
  num: number,
  numOfPlayer: number,
  depositAmount: number
) {
  const GuessNumber = await ethers.getContractFactory('GuessNumber');
  return await GuessNumber.deploy(
    keccak256(formatBytes32String(nonce)),
    keccak256(formatBytes32String(nonce + num)),
    numOfPlayer,
    { value: depositAmount }
  );
}

describe('Guess Number', function () {
  let host: Signer;
  let nonce: string;
  let nonceBytes32: string;
  let allSigners: Signer[];
  let players: Signer[];
  let guessNumber: GuessNumber;

  before(async () => {
    allSigners = await ethers.getSigners();
    host = allSigners[0];
    players = allSigners.slice(1);
    nonce = 'HELLO';
    nonceBytes32 = formatBytes32String(nonce);
  });

  describe('deploy with valid guess number, max number of players be 2', async function () {
    const num: number = 500;
    const depositAmount: number = 100;
    const numOfPlayer = 2;

    // deploy contract before each test case
    beforeEach(async function () {
      guessNumber = await deploy(nonce, num, numOfPlayer, depositAmount);
      await guessNumber.deployed();
    });

    it('smoking test: players can guess, winner can receives rewards when host reveals answer', async function () {
      // two players guess
      const txGuess0 = await guessNumber
        .connect(players[0])
        .guess(num - 2, { value: depositAmount });
      await txGuess0.wait();
      const txGuess1 = await guessNumber
        .connect(players[1])
        .guess(num + 1, { value: depositAmount });
      await txGuess1.wait();

      const player0BalanceBefore = await players[0].getBalance();
      const player1BalanceBefore = await players[1].getBalance();

      // host reveals answer and rewards is tranfered to winner
      const txReveal = await guessNumber
        .connect(host)
        .reveal(nonceBytes32, num);
      const receipt = await txReveal.wait();

      // check balance
      const rewards = BigNumber.from(depositAmount).mul(3);
      const player0BalanceAfter = await players[0].getBalance();
      const player1BalanceAfter = await players[1].getBalance();
      expect(player0BalanceAfter).to.equal(player0BalanceBefore);
      expect(player1BalanceAfter).to.equal(player1BalanceBefore.add(rewards));
    });

    describe('Guess', async function () {
      it('the first player can guess', async function () {
        const number = 100;
        const tx = await guessNumber
          .connect(players[0])
          .guess(number, { value: depositAmount });
        // const receipt = await tx.wait();
        const guesses = await guessNumber.getGuesses();
        expect(guesses).to.have.lengthOf(1);
        expect(guesses[0].player).to.equal(await players[0].getAddress());
        expect(guesses[0].number).to.equal(number);
      });

      it('the second player can guess', async function () {
        const tx0 = await guessNumber
          .connect(players[0])
          .guess(100, { value: depositAmount });
        await tx0.wait();
        const tx1 = await guessNumber
          .connect(players[1])
          .guess(200, { value: depositAmount });
        await tx1.wait();
        const guesses = await guessNumber.getGuesses();
        expect(guesses).to.have.lengthOf(2);
        expect(guesses[0].player).to.equal(await players[0].getAddress());
        expect(guesses[0].number).to.equal(100);
        expect(guesses[1].player).to.equal(await players[1].getAddress());
        expect(guesses[1].number).to.equal(200);
      });

      it('should revert when the third player submit guessing', async function () {
        const tx0 = await guessNumber
          .connect(players[0])
          .guess(100, { value: depositAmount });
        await tx0.wait();
        const tx1 = await guessNumber
          .connect(players[1])
          .guess(200, { value: depositAmount });
        await tx1.wait();
        await expect(
          guessNumber.connect(players[2]).guess(100, { value: depositAmount })
        ).to.be.revertedWith('Have reached the maximum number of players');
      });

      it('should revert guess when player inputs an negative number', async function () {
        await expect(
          guessNumber.connect(players[0]).guess(-1, { value: depositAmount })
        ).to.be.reverted;
      });

      it('should succeed when player inputs 0', async function () {
        await expect(
          guessNumber.connect(players[0]).guess(0, { value: depositAmount })
        )
          .to.emit(guessNumber, 'GuessLog')
          .withArgs(await players[0].getAddress(), 0);
      });

      it('should succeed when player inputs 999', async function () {
        await expect(
          guessNumber.connect(players[0]).guess(999, { value: depositAmount })
        )
          .to.emit(guessNumber, 'GuessLog')
          .withArgs(await players[0].getAddress(), 999);
      });

      it('should revert guess when player inputs 1000', async function () {
        await expect(
          guessNumber.connect(players[0]).guess(1000, { value: depositAmount })
        ).to.be.revertedWith('The range of this number should be [0, 1000)');
      });

      it('should revert guess when player inputs 1001', async function () {
        await expect(
          guessNumber.connect(players[0]).guess(1001, { value: depositAmount })
        ).to.be.revertedWith('The range of this number should be [0, 1000)');
      });

      it('should revert guess if the player has already submmited a guessing', async function () {
        const tx = await guessNumber
          .connect(players[0])
          .guess(100, { value: depositAmount });
        await tx.wait();
        await expect(
          guessNumber.connect(players[0]).guess(200, { value: depositAmount })
        ).to.be.revertedWith('You have submitted a guessing already');
      });

      it('should revert guess if the number has been guessed by others', async function () {
        const tx = await guessNumber
          .connect(players[0])
          .guess(100, { value: depositAmount });
        await tx.wait();
        await expect(
          guessNumber.connect(players[1]).guess(100, { value: depositAmount })
        ).to.be.revertedWith('This number has been guessed by others');
      });

      it('should revert guess if the player attaches ether value less than the host deposited', async function () {
        await expect(
          guessNumber
            .connect(players[0])
            .guess(100, { value: depositAmount - 1 })
        ).to.be.revertedWith(
          'should send the same ether value as the host deposited'
        );
      });

      it('should revert guess if the player attaches ether value more than the host deposited', async function () {
        await expect(
          guessNumber
            .connect(players[0])
            .guess(100, { value: depositAmount + 1 })
        ).to.be.revertedWith(
          'should send the same ether value as the host deposited'
        );
      });

      it('should revert guess if the game has concluded', async function () {
        const txGuess0 = await guessNumber
          .connect(players[0])
          .guess(num - 2, { value: depositAmount });
        await txGuess0.wait();
        const txGuess1 = await guessNumber
          .connect(players[1])
          .guess(num + 1, { value: depositAmount });
        await txGuess1.wait();
        const txReveal = await guessNumber
          .connect(host)
          .reveal(nonceBytes32, num);
        await txReveal.wait();

        await expect(
          guessNumber.connect(players[2]).guess(100, { value: depositAmount })
        ).to.be.revertedWith('The game has already concluded');
      });

      it('should revert if host submits guessing', async function () {
        await expect(
          guessNumber.connect(host).guess(100, { value: depositAmount })
        ).to.be.revertedWith('host can not guess');
      });
    });

    describe('Reveal', async function () {
      it('should revert reveal when not all players have submitted guessing', async function () {
        const txGuess0 = await guessNumber
          .connect(players[0])
          .guess(num - 2, { value: depositAmount });
        await txGuess0.wait();
        await expect(guessNumber.reveal(nonceBytes32, num)).to.be.revertedWith(
          'Not all players have guessed'
        );
      });

      it('should revert reveal if keccak256(nonce) doesnot equal to the nonceHash', async function () {
        const txGuess0 = await guessNumber
          .connect(players[0])
          .guess(num - 2, { value: depositAmount });
        await txGuess0.wait();
        const txGuess1 = await guessNumber
          .connect(players[1])
          .guess(num + 1, { value: depositAmount });
        await txGuess1.wait();

        await expect(
          guessNumber.reveal(formatBytes32String('Hello'), num)
        ).to.be.revertedWith('nonceHash does not match');
      });

      it('should revert reveal if keccak256(nonce + number) doesnot equal to the nonceNumHash', async function () {
        const txGuess0 = await guessNumber
          .connect(players[0])
          .guess(num - 2, { value: depositAmount });
        await txGuess0.wait();
        const txGuess1 = await guessNumber
          .connect(players[1])
          .guess(num + 1, { value: depositAmount });
        await txGuess1.wait();

        await expect(
          guessNumber.reveal(nonceBytes32, num + 1)
        ).to.be.revertedWith('nonceNumHash does not match');
      });

      it('should distribute all the rewards evenly if both guessings have the same delta', async function () {
        const txGuess0 = await guessNumber
          .connect(players[0])
          .guess(num - 1, { value: depositAmount });
        await txGuess0.wait();
        const txGuess1 = await guessNumber
          .connect(players[1])
          .guess(num + 1, { value: depositAmount });
        await txGuess1.wait();

        const player0BalanceBefore = await players[0].getBalance();
        const player1BalanceBefore = await players[1].getBalance();

        const txReveal = await guessNumber
          .connect(host)
          .reveal(nonceBytes32, num);
        await txReveal.wait();

        // check balance
        const allRewards = BigNumber.from(depositAmount).mul(3);
        const reward = allRewards.div(2);
        const player0BalanceAfter = await players[0].getBalance();
        const player1BalanceAfter = await players[1].getBalance();
        expect(player0BalanceAfter).to.equal(player0BalanceBefore.add(reward));
        expect(player1BalanceAfter).to.equal(player1BalanceBefore.add(reward));
      });

      it('should revert reveal if has revealed already', async function () {
        const txGuess0 = await guessNumber
          .connect(players[0])
          .guess(num - 1, { value: depositAmount });
        await txGuess0.wait();
        const txGuess1 = await guessNumber
          .connect(players[1])
          .guess(num + 1, { value: depositAmount });
        await txGuess1.wait();
        const txReveal = await guessNumber
          .connect(host)
          .reveal(nonceBytes32, num);
        await txReveal.wait();

        await expect(
          guessNumber.connect(host).reveal(nonceBytes32, num)
        ).to.be.revertedWith('The game has already concluded');
      });
    });
  });

  describe('deploy with different guess number', async function () {
    const depositAmount: number = 100;
    const numOfPlayer = 2;

    it('should reward the only winner correctly when deployed with number 0', async function () {
      const num = 0;
      const guessNumber = await deploy(nonce, num, numOfPlayer, depositAmount);
      for (let i = 0; i < numOfPlayer; i++) {
        const tx = await guessNumber
          .connect(players[i])
          .guess(num + 1 + i, { value: depositAmount });
        await tx.wait();
      }

      const player0BalanceBefore = await players[0].getBalance();
      const player1BalanceBefore = await players[1].getBalance();

      const txReveal = await guessNumber
        .connect(host)
        .reveal(nonceBytes32, num);
      await txReveal.wait();

      const player0BalanceAfter = await players[0].getBalance();
      const player1BalanceAfter = await players[1].getBalance();

      const allRewards = BigNumber.from(depositAmount).mul(numOfPlayer + 1);
      expect(player0BalanceAfter).to.equal(
        player0BalanceBefore.add(allRewards)
      );
      expect(player1BalanceAfter).to.equal(player1BalanceBefore);
    });

    it('should distribute the rewards evenly to all players when deploy with invalid number(test 1000 and 1001)', async function () {
      const nums: number[] = [1000, 1001];
      for (const num of nums) {
        const guessNumber = await deploy(
          nonce,
          num,
          numOfPlayer,
          depositAmount
        );
        await guessNumber.deployed();

        const txGuess0 = await guessNumber
          .connect(players[0])
          .guess(100, { value: depositAmount });
        await txGuess0.wait();
        const txGuess1 = await guessNumber
          .connect(players[1])
          .guess(200, { value: depositAmount });
        await txGuess1.wait();

        const player0BalanceBefore = await players[0].getBalance();
        const player1BalanceBefore = await players[1].getBalance();

        const txReveal = await guessNumber
          .connect(host)
          .reveal(nonceBytes32, num);
        await txReveal.wait();

        const allRewards = BigNumber.from(depositAmount).mul(3);
        const reward = allRewards.div(2);
        const player0BalanceAfter = await players[0].getBalance();
        const player1BalanceAfter = await players[1].getBalance();
        expect(player0BalanceAfter).to.equal(player0BalanceBefore.add(reward));
        expect(player1BalanceAfter).to.equal(player1BalanceBefore.add(reward));
      }
    });

    it('should revert reveal if has revealed already(deployed with invalid number)', async function () {
      const num = 1001;
      const guessNumber = await deploy(nonce, num, numOfPlayer, depositAmount);
      await guessNumber.deployed();

      const txGuess0 = await guessNumber
        .connect(players[0])
        .guess(100, { value: depositAmount });
      await txGuess0.wait();
      const txGuess1 = await guessNumber
        .connect(players[1])
        .guess(200, { value: depositAmount });
      await txGuess1.wait();

      const txReveal = await guessNumber
        .connect(host)
        .reveal(nonceBytes32, num);
      await txReveal.wait();

      await expect(
        guessNumber.connect(host).reveal(nonceBytes32, num)
      ).to.be.revertedWith('The game has already concluded');
    });
  });

  describe('has more than 2 players(test 3 players)', async function () {
    const depositAmount: number = 100;
    const numOfPlayer = 3;

    it('should give rewards to the only winner when deployed with valid number', async function () {
      const num = 500;
      guessNumber = await deploy(nonce, num, numOfPlayer, depositAmount);
      for (let i = 0; i < numOfPlayer; i++) {
        const tx = await guessNumber
          .connect(players[i])
          .guess(num + i, { value: depositAmount });
        await tx.wait();
      }

      const player0BalanceBefore = await players[0].getBalance();
      const player1BalanceBefore = await players[1].getBalance();
      const player2BalanceBefore = await players[2].getBalance();

      const txReveal = await guessNumber
        .connect(host)
        .reveal(nonceBytes32, num);
      await txReveal.wait();

      const player0BalanceAfter = await players[0].getBalance();
      const player1BalanceAfter = await players[1].getBalance();
      const player2BalanceAfter = await players[2].getBalance();

      const allRewards = BigNumber.from(depositAmount).mul(numOfPlayer + 1);
      expect(player0BalanceAfter).to.equal(
        player0BalanceBefore.add(allRewards)
      );
      expect(player1BalanceAfter).to.equal(player1BalanceBefore);
      expect(player2BalanceAfter).to.equal(player2BalanceBefore);
    });

    it('should distribute all the rewards evenly to two winners if two guessings have the same smallest delta when deployed with valid number', async function () {
      const num = 500;
      guessNumber = await deploy(nonce, num, numOfPlayer, depositAmount);
      const tx0 = await guessNumber
        .connect(players[0])
        .guess(num - 10, { value: depositAmount });
      await tx0.wait();
      const tx1 = await guessNumber
        .connect(players[1])
        .guess(num + 10, { value: depositAmount });
      await tx1.wait();
      const tx2 = await guessNumber
        .connect(players[2])
        .guess(num + 20, { value: depositAmount });
      await tx2.wait();

      const player0BalanceBefore = await players[0].getBalance();
      const player1BalanceBefore = await players[1].getBalance();
      const player2BalanceBefore = await players[2].getBalance();

      const txReveal = await guessNumber
        .connect(host)
        .reveal(nonceBytes32, num);
      await txReveal.wait();

      const player0BalanceAfter = await players[0].getBalance();
      const player1BalanceAfter = await players[1].getBalance();
      const player2BalanceAfter = await players[2].getBalance();

      const rewards = BigNumber.from(depositAmount)
        .mul(numOfPlayer + 1)
        .div(2);
      expect(player0BalanceAfter).to.equal(player0BalanceBefore.add(rewards));
      expect(player1BalanceAfter).to.equal(player1BalanceBefore.add(rewards));
      expect(player2BalanceAfter).to.equal(player2BalanceBefore);
    });

    it('should distribute the rewards evenly to all players when deployed with number 1000', async function () {
      const num = 1000;
      const guessNumber = await deploy(nonce, num, numOfPlayer, depositAmount);
      for (let i = 0; i < numOfPlayer; i++) {
        const tx = await guessNumber
          .connect(players[i])
          .guess(500 + i, { value: depositAmount });
        await tx.wait();
      }

      const player0BalanceBefore = await players[0].getBalance();
      const player1BalanceBefore = await players[1].getBalance();
      const player2BalanceBefore = await players[2].getBalance();

      const txReveal = await guessNumber
        .connect(host)
        .reveal(nonceBytes32, num);
      await txReveal.wait();

      const player0BalanceAfter = await players[0].getBalance();
      const player1BalanceAfter = await players[1].getBalance();
      const player2BalanceAfter = await players[2].getBalance();

      const rewards = BigNumber.from(depositAmount)
        .mul(numOfPlayer + 1)
        .div(numOfPlayer);
      expect(player0BalanceAfter).to.equal(player0BalanceBefore.add(rewards));
      expect(player1BalanceAfter).to.equal(player1BalanceBefore.add(rewards));
      expect(player2BalanceAfter).to.equal(player2BalanceBefore.add(rewards));
    });
  });
});
