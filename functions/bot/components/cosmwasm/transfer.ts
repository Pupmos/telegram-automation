import { createFeegrantAminoConverters } from "@cosmjs/stargate";
import { connect } from "./connect";
import { Cw20Client } from "./cw20";
import { InstantiateMsg } from './Cw20.types'
import { grantFee } from "./feegrant";
import { junoConfig } from "./networks";


export async function transferToken(contractAddress: string, amount: string, fromUserId: number, toUserId: number) {
    let rootSigner = await connect(process.env.COSMOS_MNEMONIC!, junoConfig, 0);
    let fromUserSigner = await connect(process.env.COSMOS_MNEMONIC!, junoConfig, fromUserId);
    let toUserSigner = await connect(process.env.COSMOS_MNEMONIC!, junoConfig, toUserId);
    await grantFee(junoConfig.rpcEndpoint, rootSigner.stargateClient, junoConfig.feeToken, '100000', rootSigner.address, fromUserSigner.address);

    let cw20 = new Cw20Client(fromUserSigner.client, fromUserSigner.address, contractAddress);
    let res = await cw20.transfer({ amount, recipient: toUserSigner.address });
    return {
        height: res.height,
        txHash: res.transactionHash,
        chainId: junoConfig.chainId
    }
}