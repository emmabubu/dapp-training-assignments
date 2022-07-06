import fs from 'fs';

interface Network {
  [name: string]: {
    url: string;
    chainId: number;
    symbol: string;
  };
}

export default JSON.parse(
  fs.readFileSync('./env/network.json', 'utf8')
) as Network;
