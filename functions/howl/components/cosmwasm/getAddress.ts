import { createFeegrantAminoConverters } from "@cosmjs/stargate";
import { connect } from "./connect";
import { Cw20Client } from "./cw20";
import { InstantiateMsg } from './Cw20.types'
import { grantFee } from "./feegrant";
import { defaultConfig } from "./networks";


export async function getAddress(username) {
    let fromUserSigner = await connect(process.env.COSMOS_MNEMONIC!, defaultConfig, username);
    return {
        address: fromUserSigner.address
    }
}