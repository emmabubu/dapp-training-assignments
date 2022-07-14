import { task } from 'hardhat/config';
import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
// We're only requiring hardhat-waffle here because it depends on hardhat-ethers so adding both isn't necessary.
// import '@nomiclabs/hardhat-ethers';

require('dotenv').config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

export default {
  solidity: '0.8.12',
  networks: {
    hardhat: {},
    development: {
      url: 'http://127.0.0.1:8545',
      network_id: '*',
    },
    'cronos-mainnet': {
      url: 'https://rpc.vvs.finance',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    'cronos-testnet3': {
      gasPrice: 5000000000000,
      url: 'https://cronos-testnet-3.crypto.org:8545',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  typechain: {
    outDir: './typechain-types',
    target: 'ethers-v5',
    alwaysGenerateOverloads: false, // should overloads with full signatures like deposit(uint256) be generated always, even if there are no overloads?
    externalArtifacts: ['./abis/*.json'], // optional array of glob patterns with external artifacts to process (for example external libs from node_modules)
  },
  mocha: {
    timeout: 40000,
  },
};
