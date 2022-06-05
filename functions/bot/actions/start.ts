import Telegraf from "telegraf"
import { TelegrafContext } from "telegraf/typings/context"

import { getUser } from '../components/helper'
import * as gistcache from "../components/gistcache"
import { translate } from "../components/translate"

export const startAction = async (ctx: TelegrafContext, bot: Telegraf<TelegrafContext>) => {
  const { id, isBot, name } = getUser(ctx.from)

  if (isBot) {
    return ctx.reply(`Sorry I only interact with humans!`)
  }
  const replyTargetId = ctx.message?.reply_to_message?.message_id;
  if (!replyTargetId) {
    return ctx.reply('message must be a reply!');
  }
  const msg = await gistcache.getItem(replyTargetId.toString())
  if (!msg) {
    return ctx.reply(`I don't remember seeing that message!`)
  }
  try {
    return ctx.reply(await translate(msg.text))
  } catch (e) {
    return ctx.reply(`Error occured`)
  }

}