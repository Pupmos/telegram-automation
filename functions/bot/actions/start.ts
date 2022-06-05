import Telegraf from "telegraf"
import { TelegrafContext } from "telegraf/typings/context"

import { getUser } from '../components/helper'

export const startAction = async (ctx: TelegrafContext, bot: Telegraf<TelegrafContext>) => {
  const { id, isBot, name } = getUser(ctx.from)

  if (isBot) {
    return ctx.reply(`Sorry I only interact with humans!`)
  }

  try {
    return ctx.reply(ctx.message.text + (ctx.callbackQuery?.message?.caption || '') + ctx.inlineMessageId)
  } catch (e) {
    return ctx.reply(`Error occured`)
  }

}