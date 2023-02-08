import { createFeegrantAminoConverters } from "@cosmjs/stargate";
import { connect } from "./connect";
import { Cw20Client } from "./cw20";
import { InstantiateMsg } from './Cw20.types'
import { defaultConfig } from "./networks";


export async function instantiateToken(minterAddress: string, supply: number, symbol: string, userId: number) {
    let rootSigner = await connect(process.env.COSMOS_MNEMONIC!, defaultConfig);
    
    let msg: InstantiateMsg = {
        decimals: 6,
        initial_balances: [{
            address: minterAddress,
            amount: (supply * 1_000_000).toString()   
        }],
        name: symbol,
        symbol: symbol
    }
    let res = await rootSigner.client.instantiate(rootSigner.address, defaultConfig.cw20CodeId, { ...msg }, 'pupbot-minted-cw20', 'auto');
    return {
        contractAddress: res.contractAddress,
        txHash: res.transactionHash,
        chainId: defaultConfig.chainId
    }
}