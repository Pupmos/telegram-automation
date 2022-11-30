import { connect } from "./connect";
import { Cw20Client } from "./cw20";
import { InstantiateMsg } from './Cw20.types'
import { junoConfig } from "./networks";


export async function instantiateToken(minterAddress: string, supply: number, symbol: string) {
    let signer = await connect(process.env.COSMOS_MNEMONIC!, junoConfig)
    let msg: InstantiateMsg = {
        decimals: 6,
        initial_balances: [{
            address: minterAddress,
            amount: (supply * 1_000_000).toString()   
        }],
        name: symbol,
        symbol: symbol
    }
    let res = await signer.client.instantiate(signer.address, junoConfig.cw20CodeId, { ...msg }, 'pupbot-minted-cw20', 'auto');
    return {
        contractAddress: res.contractAddress,
        txHash: res.transactionHash,
        chainId: junoConfig.chainId
    }
}