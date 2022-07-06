import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import '@nomiclabs/hardhat-ethers';
import hre from 'hardhat';
import fs from 'fs';

import { ethers } from 'ethers';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getContract = (
  contractName: string,
  address: string,
  signerOrProvider: ethers.providers.Provider | ethers.Signer
) => {
  return new hre.ethers.Contract(
    address,
    JSON.parse(fs.readFileSync(`./abis/${contractName}.json`, 'utf8')),
    signerOrProvider
  );
};

// async function getContract(
//   contractName: string,
//   address: string,
//   signer?: ethers.Signer
// ) {
//   return await hre.ethers.getContractAt(
//     JSON.parse(fs.readFileSync(`./abis/${contractName}.json`, 'utf8')),
//     address,
//     signer
//   );
// }

const fromWei = (amount: BigNumberish, decimal: BigNumberish = 18): string => {
  return typeof amount !== 'string'
    ? hre.ethers.utils.formatUnits(amount.toString(), decimal)
    : hre.ethers.utils.formatUnits(amount, decimal);
};

const toWei = (amount: BigNumberish, decimal: BigNumberish = 18) => {
  const value =
    typeof amount !== 'string'
      ? hre.ethers.utils.parseUnits(amount.toString(), decimal)
      : hre.ethers.utils.parseUnits(amount, decimal);
  return value;
};

async function getImpersonatedSigner(impersonatedAddress: string) {
  if (
    ethers.utils.isAddress(impersonatedAddress) &&
    (hre.network.name === 'hardhat' || hre.network.name === 'localhost')
  ) {
    await hre.network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [impersonatedAddress],
    });

    return await hre.ethers.getSigner(impersonatedAddress);
  } else {
    const [signer] = await hre.ethers.getSigners();
    return signer;
  }
}

const resetFork = async (url: string, blockNumber: number) => {
  await hre.network.provider.request({
    method: 'hardhat_reset',
    params: [
      {
        forking: {
          jsonRpcUrl: url,
          blockNumber: blockNumber,
        },
      },
    ],
  });
};

const send = async (transaction: any, description: string = '') => {
  await transaction.wait();
  if (description != '') {
    console.log(`Completed (${description}):`, transaction.hash);
  } else {
    console.log('Completed:', transaction.hash);
  }
};

const getBlockNumberTime = async (): Promise<[number, number]> => {
  const blockNumber = await hre.ethers.provider.getBlockNumber();
  const block = await hre.ethers.provider.getBlock(blockNumber);
  const timestamp = block.timestamp;
  return [blockNumber, timestamp];
};

async function snapshot(): Promise<number> {
  return await hre.network.provider.send('evm_snapshot');
}

async function increaseTo(timestamp: number) {
  await hre.network.provider.send('evm_setNextBlockTimestamp', [timestamp]);
}

async function revert(snapshotId: any) {
  await hre.network.provider.send('evm_revert', [snapshotId]);
}

async function mine() {
  await hre.network.provider.send('evm_mine');
}

export {
  sleep,
  getContract,
  fromWei,
  toWei,
  getImpersonatedSigner,
  resetFork,
  send,
  getBlockNumberTime,
  snapshot,
  revert,
  increaseTo,
  mine,
};
