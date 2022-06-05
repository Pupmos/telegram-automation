import Telegraf from "telegraf"
import { TelegrafContext } from "telegraf/typings/context"

import { getUser } from '../components/helper'
import { memcache } from "../components/memcache"

export const startAction = async (ctx: TelegrafContext, bot: Telegraf<TelegrafContext>) => {
  const { id, isBot, name } = getUser(ctx.from)

  if (isBot) {
    return ctx.reply(`Sorry I only interact with humans!`)
  }


  try {
    return ctx.reply(ctx.message.text + (ctx.callbackQuery?.message?.caption || '') + ctx.inlineMessageId + '' + JSON.stringify(memcache.get(ctx.message.reply_to_message.message_id)))
  } catch (e) {
    return ctx.reply(`Error occured`)
  }

}