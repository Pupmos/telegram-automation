import { assertIsDeliverTxSuccess, coins, QueryClient, SigningStargateClient } from "@cosmjs/stargate";
import * as stargateModule from '@cosmjs/stargate/build/modules/feegrant/queries'
import { Tendermint34Client } from '@cosmjs/tendermint-rpc'
import { PeriodicAllowance, BasicAllowance } from "cosmjs-types/cosmos/feegrant/v1beta1/feegrant";
import { Any } from "cosmjs-types/google/protobuf/any";
import { MsgGrantAllowance, MsgRevokeAllowance } from "cosmjs-types/cosmos/feegrant/v1beta1/tx";
import Long from "long";
import { setupFeegrantExtension } from "./feegrantExtension";


export const grantFee = async (rpc: string, client: SigningStargateClient, denom: string, spendLimit: string, payer: string, signer: string) => {
    const tmClient = await Tendermint34Client.connect(rpc);
    const queryClient = QueryClient.withExtensions(tmClient, setupFeegrantExtension);
    let allowanceExists: boolean;
    try {
        const _existingAllowance = await queryClient.feegrant.allowance(payer, signer);
        allowanceExists = true;
    } catch {
        allowanceExists = false;
    }

    if (!allowanceExists) {
        // Create feegrant allowance
        const allowance: Any = {
            typeUrl: "/cosmos.feegrant.v1beta1.PeriodicAllowance",
            value: Uint8Array.from(
                PeriodicAllowance.encode({
                    basic: {
                        spendLimit: [
                            {
                                denom: denom,
                                amount: spendLimit,
                            },
                        ],
                    },
                    period: {
                        seconds: Long.fromNumber(14),
                        nanos: 1400000
                    },
                    periodSpendLimit: [
                        {
                            denom: denom,
                            amount: spendLimit,
                        },
                    ],
                    periodCanSpend: [
                        {
                            denom: denom,
                            amount: spendLimit,
                        },
                    ],
                }).finish(),
            ),
        };
        // const allowance: Any = {
        //     typeUrl: "/cosmos.feegrant.v1beta1.BasicAllowance",
        //     value: Uint8Array.from(
        //         BasicAllowance.encode({
        //             spendLimit: [
        //                 {
        //                     denom: denom,
        //                     amount: spendLimit,
        //                 },
        //             ],
        //         }).finish(),
        //     ),
        // };
        const revokeMsg = {
            typeUrl: "/cosmos.feegrant.v1beta1.MsgRevokeAllowance",
            value: MsgRevokeAllowance.fromPartial({
                granter: payer,
                grantee: signer,
            }),
        };
        const grantMsg = {
            typeUrl: "/cosmos.feegrant.v1beta1.MsgGrantAllowance",
            value: MsgGrantAllowance.fromPartial({
                granter: payer,
                grantee: signer,
                allowance: allowance,
            }),
        };
        const grantResult = await client.signAndBroadcast(payer, [revokeMsg, grantMsg], "auto", "Create allowance").catch(e => {
            console.log("FAILED TO RUN!")
            console.info(e);
        });
        console.log("FAILED GRACEFULLY")
    }
    return true;
}