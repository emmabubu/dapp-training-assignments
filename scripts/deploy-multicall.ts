import hre from 'hardhat';
import { ethers, network } from 'hardhat';

async function main() {
  // deploy Multicall
  const Multicall = await ethers.getContractFactory('Multicall');
  const multicall = await Multicall.deploy();
  await multicall.deployed();
  console.log('Multicall deployed to:', multicall.address);

  // deploy Multicall2
  const Multicall2 = await ethers.getContractFactory('Multicall2');
  const multicall2 = await Multicall2.deploy();
  await multicall2.deployed();
  console.log('Multicall2 deployed to:', multicall2.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
