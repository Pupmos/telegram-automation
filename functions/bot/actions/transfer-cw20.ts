import Telegraf from "telegraf"
import { TelegrafContext } from "telegraf/typings/context"

import { getUser } from '../components/helper'
import * as gistcache from "../components/gistcache"
import { translate } from "../components/translate"
import { Message } from "telegraf/typings/telegram-types"
import { instantiateToken } from "../components/cosmwasm/instantiatetoken"
import { toBase64 } from "cosmwasm"
import { transferToken } from "../components/cosmwasm/transfer"

export const transferCw20Action = async (ctx: TelegrafContext, bot: Telegraf<TelegrafContext>) => {
  const { id, isBot, name } = getUser(ctx.from)
  console.log({ id, isBot, name })
  if (isBot) {
    return ctx.reply(`Sorry I only interact with humans!`)
  }
  let msg: Message;
  msg = ctx.message as string;
  // if (ctx.chat?.type !== 'private') {
  //   const replyTargetId = ctx.message?.reply_to_message?.message_id;
  //   if (!replyTargetId) {
  //     return ctx.reply('message must be a reply!');
  //   }
  //   msg = await gistcache.getItem(replyTargetId.toString())
  //   if (!msg) {
  //     return ctx.reply(`I don't remember seeing that message!`)
  //   }
  // } else {
  //   msg = ctx.message
  // }
  try {
    // message = `/transfer 3000 juno1token
    let [_cmd, amount, contractAddress] = msg.text.split(' ');
    let mention = ([...msg.text.matchAll(/@\b([-a-zA-Z0-9._]{3,25})\b/gm)])[0][1];
    console.log({ mention, amount, contractAddress })
    let data = await transferToken(contractAddress, parseInt(amount), ctx.from!.username!, mention)
    return ctx.reply(`hemlø @${mention}! ${amount} ${contractAddress} haz been sent to ur addresh. follø dis lincc to add it to ur keplr wallet 🌭 \n\n https://pupmosbot.netlify.app/add-cw20-to-wallet.html#${encodeURIComponent(btoa(JSON.stringify(data)))}`)
  } catch (e) {
    console.error(e);
    return ctx.reply(`Error occured`)
  }

}