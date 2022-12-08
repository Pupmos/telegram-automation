import { createFeegrantAminoConverters } from "@cosmjs/stargate";
import { connect } from "./connect";
import { Cw20Client } from "./cw20";
import { InstantiateMsg } from './Cw20.types'
import { grantFee } from "./feegrant";
import { defaultConfig } from "./networks";
import { coins, StdFee, toUtf8 } from "cosmwasm";
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'

export async function transferToken(contractAddress: string, amount: number, fromUserId: string, toUserId: string) {
    let rootSigner = await connect(process.env.COSMOS_MNEMONIC!, defaultConfig);
    let fromUserSigner = await connect(process.env.COSMOS_MNEMONIC!, defaultConfig, fromUserId);
    let toUserSigner = await connect(process.env.COSMOS_MNEMONIC!, defaultConfig, toUserId);

    await grantFee(defaultConfig.rpcEndpoint, rootSigner.stargateClient, defaultConfig.feeToken, '100000', rootSigner.address, fromUserSigner.address)

    const executeContractMsg = {
        typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
        value: MsgExecuteContract.fromPartial({
            sender: fromUserSigner.address,
            contract: contractAddress,
            msg: toUtf8(JSON.stringify({ amount: (amount * 1_000_000).toString(), recipient: toUserSigner.address })),
            funds: [],
        }),
    };
    fromUserSigner.stargateClient.registry.register('/cosmwasm.wasm.v1.MsgExecuteContract', MsgExecuteContract);
    const res = await fromUserSigner.stargateClient.signAndBroadcast(fromUserSigner.address, [executeContractMsg], {
        amount: coins('425', defaultConfig.feeToken),
        gas: '169790',
        granter: rootSigner.address,
        // payer: fromUserSigner.address
    });

    return {
        height: res.height,
        txHash: res.transactionHash,
        chainId: defaultConfig.chainId
    }
}