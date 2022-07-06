import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import '@nomiclabs/hardhat-ethers';
import { network } from 'hardhat';
import hre from 'hardhat';
import fs from 'fs';

import { ethers, Signer } from 'ethers';

import { ERC20, VVSVault } from '../typechain-types';

import contractAddress from './contractAddress';
import cronosNetwork from './network';
import {
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
} from './commonUtils';

// network: localhost, use hre.network.name

export async function fundVVS(signers: Signer[] | Signer) {
  const vvsVaultContract = getContract(
    'VVSVault',
    contractAddress['cronos-mainnet'].swap['VVS'].vault,
    hre.ethers.provider
  ) as VVSVault;

  if (Array.isArray(signers)) {
    for (const signer of signers) {
      const harvestTx = await vvsVaultContract.connect(signer).harvest();
      await harvestTx.wait();
    }
  } else {
    const harvestTx = await vvsVaultContract.connect(signers).harvest();
    await harvestTx.wait();
  }
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
  contractAddress,
  cronosNetwork,
};
