import Telegraf from 'telegraf'
import {startAction} from './actions/start'

// @ts-ignore
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.start(ctx => {
  return startAction(ctx, bot)
})

bot.command('translate', ctx => {
  return startAction(ctx, bot)
})

export const handler = async event => {
  try {
    await bot.handleUpdate(JSON.parse(event.body));
    return { statusCode: 200, body: '' };
  } catch (e) {
    console.log(e)
    return { statusCode: 400, body: 'This endpoint is meant for bot and telegram communication' };
  }

}