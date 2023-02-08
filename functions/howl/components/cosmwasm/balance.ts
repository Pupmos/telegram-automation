import { createFeegrantAminoConverters } from "@cosmjs/stargate";
import { connect } from "./connect";
import { Cw20Client } from "./cw20";
import { InstantiateMsg } from './Cw20.types'
import { grantFee } from "./feegrant";
import { defaultConfig } from "./networks";


export async function balance(contractAddress: string, fromUserId: string) {
    let fromUserSigner = await connect(process.env.COSMOS_MNEMONIC!, defaultConfig, fromUserId);
    let cw20 = new Cw20Client(fromUserSigner.client, fromUserSigner.address, contractAddress);
    let res = await cw20.balance({ address: fromUserSigner.address });
    return {
        chainId: defaultConfig.chainId,
        balance: +res.balance / 1_000_000,
    }
}