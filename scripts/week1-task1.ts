import hre from 'hardhat';
import { CronosOracle } from '../typechain-types';
import fs from 'fs';

const contractAddress = '0xb3DF0a9582361db08EC100bd5d8CB70fa8579f4B';
const contractName = 'CronosOracle';

async function main() {
  const cronosOracle = new hre.ethers.Contract(
    contractAddress,
    JSON.parse(fs.readFileSync(`./abis/${contractName}.json`, 'utf8')),
    hre.ethers.provider
  ) as CronosOracle;
  const latestAnswer = await cronosOracle.latestAnswer();
  const decimal = await cronosOracle.decimals();
  const price = hre.ethers.utils.formatUnits(latestAnswer.toString(), decimal);
  console.log('the latest BTC/USD price is:', price);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// npx hardhat run scripts/task1.ts --network cronos-mainnet
