import { connect } from "./connect";
import { Cw20Client } from "./cw20";
import {InstantiateMsg } from './Cw20.types'
import { junoConfig } from "./networks";


export async function instantiateToken(rpcUrl: string) {
    let signer = await connect(``, junoConfig)
    let msg: InstantiateMsg = {
        decimals: 6,
        initial_balances: [],
        name: "",
        symbol: ""
    }
}