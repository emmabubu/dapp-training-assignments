/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  WeatherRecord,
  WeatherRecordInterface,
} from "../../../artifacts/contracts/WeatherRecord";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint32",
        name: "batchId",
        type: "uint32",
      },
      {
        internalType: "bytes32",
        name: "cityName",
        type: "bytes32",
      },
    ],
    name: "getWeather",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint32",
        name: "batchId",
        type: "uint32",
      },
      {
        internalType: "bytes32",
        name: "cityName",
        type: "bytes32",
      },
      {
        internalType: "uint32",
        name: "temperature",
        type: "uint32",
      },
    ],
    name: "reportWeather",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50610281806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80633250902a1461003b578063c56d7a7114610057575b600080fd5b6100556004803603810190610050919061018a565b610087565b005b610071600480360381019061006c919061014e565b6100da565b60405161007e91906101e8565b60405180910390f35b806000808563ffffffff1663ffffffff168152602001908152602001600020600084815260200190815260200160002060006101000a81548163ffffffff021916908363ffffffff160217905550505050565b60008060008463ffffffff1663ffffffff168152602001908152602001600020600083815260200190815260200160002060009054906101000a900463ffffffff16905092915050565b6000813590506101338161021d565b92915050565b60008135905061014881610234565b92915050565b6000806040838503121561016157600080fd5b600061016f85828601610139565b925050602061018085828601610124565b9150509250929050565b60008060006060848603121561019f57600080fd5b60006101ad86828701610139565b93505060206101be86828701610124565b92505060406101cf86828701610139565b9150509250925092565b6101e28161020d565b82525050565b60006020820190506101fd60008301846101d9565b92915050565b6000819050919050565b600063ffffffff82169050919050565b61022681610203565b811461023157600080fd5b50565b61023d8161020d565b811461024857600080fd5b5056fea2646970667358221220606ad4840d2afc223eeda9443dcab7fc8677ea3109c02b70aee87fcaba7602a964736f6c63430008040033";

type WeatherRecordConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: WeatherRecordConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class WeatherRecord__factory extends ContractFactory {
  constructor(...args: WeatherRecordConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<WeatherRecord> {
    return super.deploy(overrides || {}) as Promise<WeatherRecord>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): WeatherRecord {
    return super.attach(address) as WeatherRecord;
  }
  override connect(signer: Signer): WeatherRecord__factory {
    return super.connect(signer) as WeatherRecord__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): WeatherRecordInterface {
    return new utils.Interface(_abi) as WeatherRecordInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): WeatherRecord {
    return new Contract(address, _abi, signerOrProvider) as WeatherRecord;
  }
}
