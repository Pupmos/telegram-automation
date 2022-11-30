import {
    DirectSecp256k1HdWallet,
    makeCosmoshubPath,
    SigningCosmWasmClient,
  } from "cosmwasm";
  import { Network } from "./networks";
  import { SigningStargateClient, GasPrice } from '@cosmjs/stargate'
  /**
   * 
   * @param mnemonic 
   * @param network 
   * @returns
   */
  export async function connect(mnemonic: string, network: Network, bip39Password?: string | undefined) {
    const { prefix, gasPrice, feeToken, rpcEndpoint } = network;
    const hdPath = makeCosmoshubPath(0);
  
    // Setup signer
    const offlineSigner = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      bip39Password,
      prefix,
      hdPaths: [hdPath],
    });
    const { address } = (await offlineSigner.getAccounts())[0];
    console.log(`Connected to ${address}`);
  
    let stargateClient = await SigningStargateClient.connectWithSigner(
      rpcEndpoint,
      offlineSigner,
      {
        prefix,
        gasPrice: new GasPrice(gasPrice.amount, gasPrice.denom),
      }
    );
    // Init SigningCosmWasmClient client
    const client = await SigningCosmWasmClient.connectWithSigner(
      rpcEndpoint,
      offlineSigner,
      {
        prefix,
        gasPrice,
      }
    );
    const balance = await client.getBalance(address, feeToken);
    console.log(`Balance: ${balance.amount} ${balance.denom}`);
  
    const chainId = await client.getChainId();
  
    if (chainId !== network.chainId) {
      throw Error("Given ChainId doesn't match the clients ChainID!");
    }
  
    return { client, stargateClient, address };
  }