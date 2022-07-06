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
