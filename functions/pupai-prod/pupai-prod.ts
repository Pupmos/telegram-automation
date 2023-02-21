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
import * as daoUtils from "@dao-dao/state";
import { EncodeObject } from "@cosmjs/proto-signing";

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
    `MSGS: ${proposal.msgs?.map((m) => {
      let msg = m?.wasm?.execute?.msg;
      if (!!msg) {
        try {
          m.wasm.execute.msg = JSON.parse(atob(msg));
        } catch (e) {}
      }
      return JSON.stringify(m, null, 2);
    })}`,
  ].join("\n");
}

function randomResponseLabel() {
  const labels = [
    "divyne will",
    "divine decrea",
    "cømmandment",
    "edict",
    "mand8",
    "ordinanze",
    "precept",
    "ūkase",
    "prøclamashon",
    "fiat",
    "judgment",
    "pronounzement",
    "rooling",
    "dicctum",
    "rezcript",
    "decrea",
    "ordor",
    "direccshon",
    "decizion",
    "verdickt",
  ];
  return labels[Math.floor(Math.random() * labels.length)].toUpperCase();
}
export async function howlMentions() {
  const BOT_USERNAME = "pupai";
  // const PUPAI_ADDRESS = "juno175umqftc5jtxtl5gqt7g7w3c9w3v55prkegvqk";
  const PROPOSALS_ADDRESS =
    "juno1v30x8qdlqrj3443r7mw3zdxph3ywc209kxkwtahmlacsa58zaktsx3atkd";
  const VOTING_ADDRESS =
    "juno1v30x8qdlqrj3443r7mw3zdxph3ywc209kxkwtahmlacsa58zaktsx3atkd";
  const PRE_PROPOSE_ADDRESS =
    "juno1cq9zpqtfnqh7dhya20sp27ddzxmw9pudxz0qnlv6u702g8r5vy6qa2hrmu";
  const client = await connect(process.env.HOWL_PUPBOT_MNEMONIC!, junoConfig);
  let { proposals } = await client.client.queryContractSmart(
    PROPOSALS_ADDRESS,
    {
      reverse_proposals: {
        limit: 5,
      },
    }
  );

  const responses: {
    proposal_id: string;
    title: string;
    description: string;
    is_worthy: boolean;
    raw: string;
  }[] = [];
  const messages: EncodeObject[] = [];
  for (let { proposal, id } of proposals) {
    const isOpen = proposal.status === "open";
    const isExecuted = proposal.status === "executed";
    const prompt = proposalToText(proposal);
    if (!prompt || !isOpen) {
      if (proposal.proposer === client.address && !isExecuted) {
        // execute the proposal to pay back deposit to the bot.
        messages.push({
          typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
          value: MsgExecuteContract.fromPartial({
            sender: client.address,
            contract: PROPOSALS_ADDRESS,
            msg: toUtf8(
              JSON.stringify({
                execute: {
                  proposal_id: id,
                },
              })
            ),
          }),
        });
      }
      continue;
    }
    if (proposal.proposer === client.address) {
      messages.push({
        typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
        value: MsgExecuteContract.fromPartial({
          sender: client.address,
          contract: VOTING_ADDRESS,
          msg: toUtf8(
            JSON.stringify({
              vote: {
                proposal_id: id,
                vote: "yes",
              },
            })
          ),
        }),
      });
      continue;
    }
    const output = await queryGPT(prompt, "hooman subjecc", false);
    const parts = output.split("\n");
    const vote = parts
      .find((p) => p.startsWith("VOTE: "))
      ?.replace("VOTE: ", "")
      .trim()
      .toLowerCase();
    const reason =
      parts
        .find((p) => p.startsWith("REASON: "))
        ?.replace("REASON: ", "")
        .trim() || "";
    if (isOpen) {
      // the title of the response proposal should be the first X sentences of the reason cumulatively under 40 characters
      // the description should be the entire reason
      const title = reason.substring(0, 250);
      const description = reason;

      responses.push({
        proposal_id: id,
        title,
        description,
        raw: reason,
        is_worthy: vote === "yes",
      });
      messages.push({
        typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
        value: MsgExecuteContract.fromPartial({
          sender: client.address,
          contract: VOTING_ADDRESS,
          msg: toUtf8(
            JSON.stringify({
              vote: {
                proposal_id: id,
                vote: vote,
              },
            })
          ),
        }),
      });
    }
  }
  if (responses.length) {
    // include a little bit of juno to pay for the txs so the bot pays for itself.
    const bankMsg = {
      bank: {
        send: {
          to_address: client.address,
          amount: [
            {
              denom: "ujuno",
              amount: 0.3 * 1e6 + "",
            },
          ],
        },
      },
    };
    messages.push({
      typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
      value: MsgExecuteContract.fromPartial({
        sender: client.address,
        contract: PRE_PROPOSE_ADDRESS,
        msg: toUtf8(
          JSON.stringify({
            propose: {
              msg: {
                propose: {
                  title: (
                    `🐶 PUPAI: ` +
                    responses
                      .map((p) => {
                        return p.title;
                      })
                      .join(", ")
                  ).substring(0, 250),
                  description: responses
                    .map((p) => {
                      return `## ${p.proposal_id}: ${p.description}`;
                    })
                    .join("\n\n\n"),
                  msgs: [bankMsg],
                },
              },
            },
          })
        ),
        funds: [
          {
            denom: "ujuno",
            amount: 2.049 * 1e6 + "",
          },
        ],
      }),
    });
  }
  if (messages.length) {
    const res = await client.client.signAndBroadcast(
      client.address,
      messages,
      "auto"
    );
    console.log({ res });
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
}

export const handler = async (event) => {
  try {
    howlMentions();
    await new Promise((r) => setTimeout(r, 9700));
    return { statusCode: 200, body: "succesh!" };
  } catch (e) {
    console.log(e);
    return {
      statusCode: 200,
      body: "error with chatgpt",
    };
  }
};
