// found this template in https://github.com/CosmWasm/academy-deploy/blob/main/scripts/networks.ts.
// not too shabby so i'll keep it for the time being.

// data from https://github.com/cosmos/chain-registry/tree/master/testnets
import { GasPrice } from "cosmwasm";

export interface Network {
  chainId: string;
  rpcEndpoint: string;
  prefix: string;
  gasPrice: GasPrice;
  feeToken: string;
  cw20CodeId: number;
}

export const junoConfig: Network = {
  chainId: "juno-1",
  rpcEndpoint: "https://rpc-juno.pupmos.network/",
  prefix: "juno",
  gasPrice: GasPrice.fromString("0.25ujuno"),
  feeToken: "ujuno",
  cw20CodeId: 262
};