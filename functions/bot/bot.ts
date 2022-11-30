import Telegraf from 'telegraf'
import { cacheAction } from './actions/cache';
import { instantiateCw20Action } from './actions/instantiate-cw20';
import {startAction} from './actions/start'

// @ts-ignore
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.start(ctx => {
  return startAction(ctx, bot)
})

bot.on('text', async (ctx, next) => {
  if (ctx.chat?.type === 'private') {
    return startAction(ctx, bot)
  }
  else await cacheAction(ctx, bot)
  return next()
})

bot.command('hoomanize', ctx => {
  return startAction(ctx, bot)
})

bot.command('mint', ctx => {
  return instantiateCw20Action(ctx, bot)
})

bot.command('pup', ctx => {
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