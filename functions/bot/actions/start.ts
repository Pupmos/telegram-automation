import Telegraf from "telegraf"
import { TelegrafContext } from "telegraf/typings/context"

import { getUser } from '../components/helper'
import * as gistcache from "../components/gistcache"
import { translate } from "../components/translate"
import { Message } from "telegraf/typings/telegram-types"

export const startAction = async (ctx: TelegrafContext, bot: Telegraf<TelegrafContext>) => {
  const { id, isBot, name } = getUser(ctx.from)
  console.log({ id, isBot, name })
  if (isBot) {
    return ctx.reply(`Sorry I only interact with humans!`)
  }
  let msg: Message;
  msg = ctx.message;
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
    const formattedMessage = msg.text.split('\n').join(' ').split('\t').join(' ');
    let increaseInnocence = ctx.chat?.id === -1001261146654;
    // wait 5 seconds. slow down the bot until the open ai limit is increased
    const translatedTextPromise = translate(formattedMessage, name, increaseInnocence).catch(e => 'esscuze me butt i am nappin. u can not hav da zoomiez wifout da snooziez 🌭');
    await new Promise(resolve => setTimeout(resolve, 5000));
    const translatedText = await translatedTextPromise;
    // console.log(`\n\n\nchat_id:${ctx.chat?.id}\nprompt: "${formattedMessage}"\n\nresponse: "${translatedText}"\n\n`)
    return ctx.replyWithMarkdownV2(`\`"${translatedText}"\``, {
      reply_to_message_id: msg.message_id,
      allow_sending_without_reply: true
    })
  } catch (e) {
    console.error(e);
    return ctx.reply(`Error occured`)
  }

}