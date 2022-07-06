import fs from 'fs';

interface ContractAddress {
  [networkName: string]: Cronos;
}

interface Cronos {
  swap: Swap;
  tokens: Tokens;
}

interface Swap {
  [platform: string]: {
    factory: string;
    router: string;
    pairs: {
      [pair: string]: string;
    };
    vault: string;
    masterChef?: string;
  };
}

interface Tokens {
  [token: string]: string;
}

export default JSON.parse(
  fs.readFileSync('./env/contractAddress.json', 'utf8')
) as ContractAddress;
