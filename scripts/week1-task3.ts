import hre from 'hardhat';
import { ethers } from 'hardhat';
import { WeatherRecord } from '../typechain-types';
import fs from 'fs';
import {
  Multicall,
  ContractCallResults,
  ContractCallContext,
} from 'ethereum-multicall';
import { CallContext } from 'ethereum-multicall/dist/esm/models/index';
import network from '../utils/network';

async function main() {
  const multicallAddress = '0x776239Da2054d8A31075bF21c5CA8E50B1faabB2';
  const multicall2Address = '0xee15888091C61b2D4Bf9B5194B55c47Ab7FdB2ca';
  const weatherRecordAddress = '0x49354813d8BFCa86f778DfF4120ad80E4D96D74E';
  const targetContractName = 'WeatherRecord';
  const batchId = 1657079472;
  const cities = ['shanghai', 'hongkong', 'london'];
  const weatherReferName = 'weatherRecordContract';

  let calls: CallContext[] = [];
  for (const city of cities) {
    let call = {} as CallContext;
    call.reference = city;
    call.methodName = 'getWeather';
    call.methodParameters = [batchId, ethers.utils.formatBytes32String(city)];
    calls.push(call);
  }

  const multicall = new Multicall({
    multicallCustomContractAddress: multicall2Address,
    nodeUrl: network['cronos-testnet3'].url,
    tryAggregate: true,
  });

  const contractCallContext: ContractCallContext[] = [
    {
      reference: weatherReferName,
      contractAddress: weatherRecordAddress,
      abi: JSON.parse(
        fs.readFileSync(`./abis/${targetContractName}.json`, 'utf8')
      ),
      calls: calls,
    },
  ];

  const results: ContractCallResults = await multicall.call(
    contractCallContext
  );
  console.log(results.results[weatherReferName].callsReturnContext);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
