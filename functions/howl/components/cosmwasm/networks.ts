// found this template in https://github.com/CosmWasm/academy-deploy/blob/main/scripts/networks.ts.
// not too shabby so i'll keep it for the time being.

// data from https://github.com/cosmos/chain-registry/tree/master/testnets
import { SigningStargateClient, GasPrice } from '@cosmjs/stargate'


export interface Network {
  chainId: string;
  rpcEndpoint: string;
  prefix: string;
  gasPrice: GasPrice;
  feeToken: string;
  cw20CodeId: number;
}
// https://rpc-chihuahua.pupmos.network/
export const defaultConfig: Network = {
  chainId: "chihuahua-1",
  rpcEndpoint: "https://rpc-chihuahua.pupmos.network/",
  prefix: "chihuahua",
  gasPrice: GasPrice.fromString("0.25uhuahua"),
  feeToken: "uhuahua",
  cw20CodeId: 18
};

export const junoConfig: Network = {
  chainId: "juno-1",
  rpcEndpoint: "https://rpc-juno.pupmos.network/",
  prefix: "juno",
  gasPrice: GasPrice.fromString("5.5ujuno"),
  feeToken: "ujuno",
  cw20CodeId: 262
};