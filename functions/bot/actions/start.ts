import Telegraf from "telegraf"
import { TelegrafContext } from "telegraf/typings/context"

import { getUser } from '../components/helper'
import { memcache } from "../components/memcache"
import { translate } from "../components/translate"

export const startAction = async (ctx: TelegrafContext, bot: Telegraf<TelegrafContext>) => {
  const { id, isBot, name } = getUser(ctx.from)

  const msg = memcache.get(ctx.message.reply_to_message.message_id)
  if (isBot) {
    return ctx.reply(`Sorry I only interact with humans!`)
  }
  if (!msg) {
    return ctx.reply(`I don't remember seeing that message!`)
  }
  try {
    return ctx.reply(await translate(msg.text))
  } catch (e) {
    return ctx.reply(`Error occured`)
  }

}