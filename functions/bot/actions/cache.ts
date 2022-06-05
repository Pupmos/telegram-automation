import Telegraf from "telegraf"
import { TelegrafContext } from "telegraf/typings/context"
import { memcache } from "../components/memcache"

const cacheUserId = 5312444028
export const cacheAction = async (ctx: TelegrafContext, bot: Telegraf<TelegrafContext>) => {
  console.log({ from: ctx.from?.id, cacheUserId})
  if (!ctx.message || ctx.from.id !== cacheUserId) return;
  memcache.set(ctx.message.message_id, ctx.message!)
  return Promise.resolve()
}