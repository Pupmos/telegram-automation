import Telegraf from "telegraf"
import { TelegrafContext } from "telegraf/typings/context"
import * as gistcache from "../components/gistcache"

const cacheUserId = 5312444028
export const cacheAction = async (ctx: TelegrafContext, bot: Telegraf<TelegrafContext>) => {
  console.log({ from: ctx.from?.id, cacheUserId})
  if (!ctx.message) return console.error('no message! failed!');
  // await gistcache.setItem(ctx.message.message_id.toString(), ctx.message!)
  return Promise.resolve(ctx)
}