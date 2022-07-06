import hre from 'hardhat';
import { ethers } from 'hardhat';
import { WeatherRecord } from '../typechain-types';
import fs from 'fs';
import axios from 'axios';

const contractAddress = '0x49354813d8BFCa86f778DfF4120ad80E4D96D74E';
const contractName = 'WeatherRecord';

interface CityTemp {
  [city: string]: number;
}

async function getCityTemperature(cities: string[]) {
  let cityTempPairs = {} as CityTemp;
  for (const city of cities) {
    const url = `https://goweather.herokuapp.com/weather/${city}`;
    const resp = await axios.get(url);
    const tempString = resp.data.temperature as string;
    // const myRe = /-{0,1}[0-9]{1,}/;
    const myRe = /[0-9]{1,}/;
    const tempResult = myRe.exec(tempString);
    let temp: number;
    if (Array.isArray(tempResult)) {
      temp = parseInt(tempResult[0]);
    } else {
      temp = NaN;
    }
    cityTempPairs[city] = temp;
  }
  return cityTempPairs;
}

function getBatchId() {
  return Math.floor(new Date().getTime() / 1000);
}

async function main() {
  // generate batchId
  const batchId = getBatchId();
  console.log('batchId:', batchId);

  // get weather info
  const cities = ['shanghai', 'hongkong', 'london'];
  const cityTempPairs = await getCityTemperature(cities);

  // get contract instance
  const signer = (await hre.ethers.getSigners())[0];
  const weatherRecord = new hre.ethers.Contract(
    contractAddress,
    JSON.parse(fs.readFileSync(`./abis/${contractName}.json`, 'utf8')),
    signer
  ) as WeatherRecord;

  // send tx and get result
  for (const city in cityTempPairs) {
    const cityBytes32 = ethers.utils.formatBytes32String(city);
    const tx = await weatherRecord.reportWeather(
      batchId,
      cityBytes32,
      cityTempPairs[city]
    );
    const receipt = await tx.wait();
    const result = await weatherRecord.getWeather(batchId, cityBytes32);
    console.log(`======== city name: ${city} =======`);
    console.log('Temperature from api ======>', city, cityTempPairs[city]);
    console.log('Temperature from contract =>', city, result);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
