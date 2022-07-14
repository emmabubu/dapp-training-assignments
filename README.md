# dapp-training-assignments

## Week1 Assignment

### task 1

code is in [task1.ts](scripts/task1.ts)

run script

```
npx hardhat run scripts/task1.ts --network cronos-mainnet
```

sample output

```
the latest BTC/USD price is: 20096.81
```

### task 2

code is in [task2.ts](scripts/task2.ts)

run script

```
npx hardhat run scripts/task2.ts --network cronos-testnet3
```

sample output

```
batchId: 1657095430
======== city name: shanghai =======
Temperature from api ======> shanghai 36
Temperature from contract => shanghai 36
======== city name: hongkong =======
Temperature from api ======> hongkong 30
Temperature from contract => hongkong 30
======== city name: london =======
Temperature from api ======> london 15
Temperature from contract => london 15
```

### Additional Task

#### Question 1

Set a state variable **decimals** in contract like ERC20 contract. For example, if decimals is 2, the temperature is 27.2, then use 27.2e2(2720) instead of 27.2 to submit the data.

#### Question 2

Can use 1st bit of the uint32 number as a sign flag. So when the temperature is negative, eg. -12, then use number `2**31 + 12` instead. When read the weather information from contract, if the temperature is bigger than `2**31`, subtract `2**31` from that number then negate it

#### Question 3

code is in [task3.ts](scripts/task3.ts)

Use [Multicall](https://github.com/makerdao/multicall) to group multiple smart contract constant function calls into a single call and aggregate results into a single result.

Use [ethereum-multicall](https://github.com/joshstevens19/ethereum-multicall) to interact with Multicall smart contract.

1. Deploy Multicall2 smart contract to testnet

Multicall2 Address on testnet is 0xee15888091C61b2D4Bf9B5194B55c47Ab7FdB2ca

```
npx hardhat run scripts/deploy.ts --network cronos-testnet3
```

2. Group multiple calls to getWeather function and aggregate the results

run

```
npx hardhat run scripts/task3.ts --network cronos-testnet3
```

sample output

```
[
  {
    returnValues: [ 35 ],
    decoded: true,
    reference: 'shanghai',
    methodName: 'getWeather',
    methodParameters: [
      1657079472,
      '0x7368616e67686169000000000000000000000000000000000000000000000000'
    ],
    success: true
  },
  {
    returnValues: [ 29 ],
    decoded: true,
    reference: 'hongkong',
    methodName: 'getWeather',
    methodParameters: [
      1657079472,
      '0x686f6e676b6f6e67000000000000000000000000000000000000000000000000'
    ],
    success: true
  },
  {
    returnValues: [ 14 ],
    decoded: true,
    reference: 'london',
    methodName: 'getWeather',
    methodParameters: [
      1657079472,
      '0x6c6f6e646f6e0000000000000000000000000000000000000000000000000000'
    ],
    success: true
  }
]
```

## Week 2 Assignment

smart contract code is in [GuessNumber.sol](contracts/GuessNumber.sol)

test file is in [guessNumber.test.ts](test/guessNumber.test.ts)

Run test case

```
npx hardhat test
```

Sample outputs

```
% npx hardhat test
Generating typings for: 0 artifacts in dir: ./typechain-types for target: ethers-v5
Successfully generated 10 typings!
Successfully generated 20 typings for external artifacts!


  Guess Number
    deploy with valid guess number, max number of players be 2
      ✔ smoking test: players can guess, winner can receives rewards when host reveals answer (58ms)
      Guess
        ✔ the first player can guess
        ✔ the second player can guess
        ✔ should revert when the third player submit guessing
        ✔ should revert guess when player inputs an negative number
        ✔ should succeed when player inputs 0
        ✔ should succeed when player inputs 999
        ✔ should revert guess when player inputs 1000
        ✔ should revert guess when player inputs 1001
        ✔ should revert guess if the player has already submmited a guessing
        ✔ should revert guess if the number has been guessed by others
        ✔ should revert guess if the player attaches ether value less than the host deposited
        ✔ should revert guess if the player attaches ether value more than the host deposited
        ✔ should revert guess if the game has concluded (42ms)
        ✔ should revert if host submits guessing
      Reveal
        ✔ should revert reveal when not all players have submitted guessing
        ✔ should revert reveal if keccak256(nonce) doesnot equal to the nonceHash
        ✔ should revert reveal if keccak256(nonce + number) doesnot equal to the nonceNumHash
        ✔ should distribute all the rewards evenly if both guessings have the same delta
        ✔ should revert reveal if has revealed already (39ms)
    deploy with different guess number
      ✔ should reward the only winner correctly when deployed with number 0 (76ms)
      ✔ should distribute the rewards evenly to all players when deploy with invalid number(test 1000 and 1001) (97ms)
      ✔ should revert reveal if has revealed already(deployed with invalid number) (54ms)
    has more than 2 players(test 3 players)
      ✔ should give rewards to the only winner when deployed with valid number (56ms)
      ✔ should distribute all the rewards evenly to two winners if two guessings have the same smallest delta when deployed with valid number (54ms)
      ✔ should distribute the rewards evenly to all players when deployed with number 1000 (60ms)


  26 passing (1s)

```
