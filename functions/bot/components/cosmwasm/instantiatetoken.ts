import { createFeegrantAminoConverters } from "@cosmjs/stargate";
import { connect } from "./connect";
import { Cw20Client } from "./cw20";
import { InstantiateMsg } from './Cw20.types'
import { junoConfig } from "./networks";


export async function instantiateToken(minterAddress: string, supply: number, symbol: string, userId: number) {
    let rootSigner = await connect(process.env.COSMOS_MNEMONIC!, junoConfig, 0);
    let userSigner = await connect(process.env.COSMOS_MNEMONIC!, junoConfig, userId);
    
    let msg: InstantiateMsg = {
        decimals: 6,
        initial_balances: [{
            address: minterAddress,
            amount: (supply * 1_000_000).toString()   
        }],
        name: symbol,
        symbol: symbol
    }
    let res = await rootSigner.client.instantiate(rootSigner.address, junoConfig.cw20CodeId, { ...msg }, 'pupbot-minted-cw20', 'auto');
    return {
        contractAddress: res.contractAddress,
        txHash: res.transactionHash,
        chainId: junoConfig.chainId
    }
}