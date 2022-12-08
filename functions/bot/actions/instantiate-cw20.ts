import Telegraf from "telegraf"
import { TelegrafContext } from "telegraf/typings/context"

import { getUser } from '../components/helper'
import * as gistcache from "../components/gistcache"
import { translate } from "../components/translate"
import { Message } from "telegraf/typings/telegram-types"
import { instantiateToken } from "../components/cosmwasm/instantiatetoken"
import { toBase64 } from "cosmwasm"

export const instantiateCw20Action = async (ctx: TelegrafContext, bot: Telegraf<TelegrafContext>) => {
  const { id, isBot, name, username } = getUser(ctx.from)
  console.log({ id, isBot, name, username })
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
    // message = `/mint juno12345678910 3000 DOGGO
    let [_cmd, minterAddress, supply, symbol] = msg.text.split(' ');
    let data = await instantiateToken(minterAddress, parseInt(supply), symbol, +id)
    const ADD_TO_KEPLR_LINK = `https://pupmosbot.netlify.app/add-cw20-to-wallet.html#${encodeURIComponent(btoa(JSON.stringify(data)))}`;
    return ctx.replyWithMarkdown(`hemlø @${username}! ${supply} $${symbol} haz been minted to ${minterAddress}. \n\n[Add to Keplr](${ADD_TO_KEPLR_LINK}) 🌭`)
  } catch (e) {
    console.error(e);
    return ctx.reply(`Error occured`)
  }

}