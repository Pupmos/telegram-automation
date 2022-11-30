import { createFeegrantAminoConverters } from "@cosmjs/stargate";
import { connect } from "./connect";
import { Cw20Client } from "./cw20";
import { InstantiateMsg } from './Cw20.types'
import { grantFee } from "./feegrant";
import { junoConfig } from "./networks";


export async function balance(contractAddress: string, fromUserId: string) {
    let fromUserSigner = await connect(process.env.COSMOS_MNEMONIC!, junoConfig, fromUserId);
    let cw20 = new Cw20Client(fromUserSigner.client, fromUserSigner.address, contractAddress);
    let res = await cw20.balance({ address: fromUserSigner.address });
    return {
        chainId: junoConfig.chainId,
        balance: +res.balance / 1_000_000,
    }
}