import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { toUtf8 } from "cosmwasm";
import Telegraf from "telegraf";
import { getAddressAction } from "./actions/address-cw20";
import { cacheAction } from "./actions/cache";
import { instantiateCw20Action } from "./actions/instantiate-cw20";
import { startAction } from "./actions/start";
import { transferCw20Action } from "./actions/transfer-cw20";
import { connect } from "./components/cosmwasm/connect";
import { junoConfig } from "./components/cosmwasm/networks";
import { Configuration, OpenAIApi } from "openai";
import { queryGPT } from "./components/queryGPT";
import { randomUUID } from "crypto";
import * as daoUtils from '@dao-dao/state'



function proposalToText(proposal: any) {
  // if (!proposal || proposal?.status !== 'open') {
  //   return;
  // }
  if (!proposal) {
    return;
  }
  return [
    `TITLE: ${proposal.title}`,
    `DESCRIPTION: ${proposal.description}`,
    `MSGS: ${proposal.msgs?.map(
      m => {
        let msg = m?.wasm?.execute?.msg;
        if (!!msg) {
          try {
            m.wasm.execute.msg = JSON.parse(atob(msg))
          } catch (e) {

          }
        }
        return JSON.stringify(
          m,
          null,
          2
        );
      }
    )}`
  ].join('\n');
}

export async function howlMentions() {
  const BOT_USERNAME = 'pupai';
  const PROPOSALS_ADDRESS = 'juno1v30x8qdlqrj3443r7mw3zdxph3ywc209kxkwtahmlacsa58zaktsx3atkd';
  const VOTING_ADDRESS = 'juno1v30x8qdlqrj3443r7mw3zdxph3ywc209kxkwtahmlacsa58zaktsx3atkd';
  const client = await connect(process.env.HOWL_PUPBOT_MNEMONIC!, junoConfig)
  let { proposals } = await client.client.queryContractSmart(PROPOSALS_ADDRESS, {
    reverse_proposals: {
      limit: 5
    }
  });

  

  for (let { proposal, id } of proposals) {
    console.log(proposalToText(proposal))
    const prompt = proposalToText(proposal);
    if (!prompt) {
      continue;
    }
    const output = await queryGPT(prompt, 'hooman subjecc', false);
    const isOpen = proposal.status === 'open';
    const isExecuted = proposal.status === 'executed';
    const vote = output.match(/VOTE: (.*)/)[1];
    const reason = output.match(/REASON: (.*)/)[1];
    if (isOpen) {
      const vote_res = await client.client.execute(client.address, VOTING_ADDRESS, {
        "vote": {
          "proposal_id": id,
          "vote": vote
        }
      }, "auto", reason);
    }
  }

  // const hasAlreadyReplied = (postId: string) => {
  //   console.log({ postId })
  //   return client.client.queryContractSmart(HOWL_ADDRESS, {
  //     list_replies: {
  //       parent_id: postId
  //     }
  //   }).then(
  //     r => {
  //       console.log(r)
  //       return r.posts.some(
  //         p => p.post.creator == BOT_USERNAME
  //       )
  //     }
  //   )
  // }
  // // return;
  // const replyDelayMinutes = 60;
  // // only include mentions we have not replied to
  // mentions = mentions.filter(m => {
  //   return m.post.timestamp * 1000 > Date.now() - replyDelayMinutes * 60 * 1000;
  // });

  // console.log(mentions)

  // const hasAlreadyRepliedRes = mentions.map(m => hasAlreadyReplied(m.uuid))
  // let i = 0;
  // for (let m of mentions) {
  //   if (await hasAlreadyRepliedRes[i++]) {
  //     console.log('already replied to:' + m.post.body)
  //     continue;
  //   }
  //   const formattedText = m.post.body.replaceAll('@' + BOT_USERNAME, '').replaceAll(BOT_USERNAME, '')
  //   const increaseInnocence = false;
  //   const dogModifier = increaseInnocence ? ` (very innocent)` : "";
  //   const sampleText = `human (named ${m.post.creator}): "${formattedText}"\ndog${dogModifier}:`;
  //   console.log(sampleText)
  //   const response = await queryGPT(sampleText, '@' + m.post.creator, false)
  //   console.log(response)

  //   const executeContractMsg = {
  //     typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
  //     value: MsgExecuteContract.fromPartial({
  //       sender: client.address,
  //       contract: HOWL_ADDRESS,
  //       msg: toUtf8(JSON.stringify({
  //         "mint": {
  //           "owner": client.address,
  //           "token_id": randomUUID(),
  //           "extension": {
  //             "body": response,
  //             "creator": BOT_USERNAME,
  //             "is_reply_to": m.uuid,
  //             "mentions": [],
  //             "hashtags": []
  //           }
  //         }
  //       })),
  //       funds: [],
  //     }),
  //   };
  //   // burn token message 
  //   client.stargateClient.registry.register('/cosmwasm.wasm.v1.MsgExecuteContract', MsgExecuteContract);
  //   const res = await client.stargateClient.signAndBroadcast(client.address, [executeContractMsg], 'auto');
  //   // assume it works out.
  //   // break once it's successful. only do one at a time.
  //   break;
  // }

  console.log(JSON.stringify(proposals, null, 2))
}

export const handler = async (event) => {
  try {
    howlMentions()
    await new Promise(r => setTimeout(r, 9500))
    return { statusCode: 200, body: "succesh!" };
  } catch (e) {
    console.log(e);
    return {
      statusCode: 200,
      body: "error with chatgpt",
    };
  }
};
