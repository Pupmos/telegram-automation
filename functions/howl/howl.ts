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



export async function howlMentions() {
  const BOT_USERNAME = 'pupai';
  const HOWL_ADDRESS = 'juno10vsrvy5k5kkesmfd4ez2k6rm4l72ufuk463hnwdugtyx7j4t7v4qnhhwms'
  const client = await connect(process.env.HOWL_PUPBOT_MNEMONIC!, junoConfig)
  let { posts: mentions } = await client.client.queryContractSmart(HOWL_ADDRESS, {
    list_mentions: {
      mentioned_alias: BOT_USERNAME,
      limit: 10,
    }
  });
  const hasAlreadyReplied = (postId: string) => {
    console.log({ postId })
    return client.client.queryContractSmart(HOWL_ADDRESS, {
      list_replies: {
        parent_id: postId
      }
    }).then(
      r => {
        console.log(r)
        return r.posts.some(
          p => p.post.creator == BOT_USERNAME
        )
      }
    )
  }
  // return;
  const replyDelayMinutes = 60;
  // only include mentions we have not replied to
  mentions = mentions.filter(m => {
    return m.post.timestamp * 1000 > Date.now() - replyDelayMinutes * 60 * 1000;
  });

  console.log(mentions)

  const hasAlreadyRepliedRes = mentions.map(m => hasAlreadyReplied(m.uuid))
  let i = 0;
  for (let m of mentions) {
    if (await hasAlreadyRepliedRes[i++]) {
      console.log('already replied to:' + m.post.body)
      continue;
    }
    const formattedText = m.post.body.replaceAll('@' + BOT_USERNAME, '').replaceAll(BOT_USERNAME, '')
    const increaseInnocence = false;
    const dogModifier = increaseInnocence ? ` (very innocent)` : "";
    const sampleText = `human (named ${m.post.creator}): "${formattedText}"\ndog${dogModifier}:`;
    console.log(sampleText)
    const response = await queryGPT(sampleText, '@' + m.post.creator, false)
    console.log(response)

    const executeContractMsg = {
      typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
      value: MsgExecuteContract.fromPartial({
        sender: client.address,
        contract: HOWL_ADDRESS,
        msg: toUtf8(JSON.stringify({
          "mint": {
            "owner": client.address,
            "token_id": randomUUID(),
            "extension": {
              "body": response,
              "creator": BOT_USERNAME,
              "is_reply_to": m.uuid,
              "mentions": [],
              "hashtags": []
            }
          }
        })),
        funds: [],
      }),
    };
    // burn token message 
    client.stargateClient.registry.register('/cosmwasm.wasm.v1.MsgExecuteContract', MsgExecuteContract);
    const res = await client.stargateClient.signAndBroadcast(client.address, [executeContractMsg], 'auto');
    // assume it works out.
    // break once it's successful. only do one at a time.
    break;
  }

  // Sample Output: 
  // [
  //   {
  //     "uuid": "3dd79e65-0915-4968-855a-db04ef072bcb",
  //     "post": {
  //       "image_uri": null,
  //       "body": "tezting somefhin. @pupbot ",
  //       "mentions": [
  //         "pupbot"
  //       ],
  //       "hashtags": null,
  //       "is_reply_to": null,
  //       "timestamp": 1675807507,
  //       "creator": "pupmosis",
  //       "creator_addr": "juno1z8u80j9xcye4l2vumcq85y85h68ymjcwp4ekvw",
  //       "longform_content": null
  //     },
  //     "reply_count": 2,
  //     "parent": null
  //   }
  // ]

  // MsgExecuteContract
  // client.client.execute(client.address, HOWL_ADDRESS, {
  //     "mint": {
  //       "owner": client.address,
  //       "token_id": "ed88abf9-3854-453d-9bc9-bb1a6eb7bda5",
  //       "extension": {
  //         "body": "datz pretty neet",
  //         "creator": "pupbot",
  //         "is_reply_to": "3dd79e65-0915-4968-855a-db04ef072bcb",
  //         "mentions": [],
  //         "hashtags": []
  //       }
  //     }
  //   })
  console.log(JSON.stringify(mentions, null, 2))
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
