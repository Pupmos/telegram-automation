import Telegraf from "telegraf";
import { getAddressAction } from "./actions/address-cw20";
import { cacheAction } from "./actions/cache";
import { instantiateCw20Action } from "./actions/instantiate-cw20";
import { startAction } from "./actions/start";
import { transferCw20Action } from "./actions/transfer-cw20";

// @ts-ignore
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.start((ctx) => {
  return startAction(ctx, bot);
});

bot.on("text", async (ctx, next) => {
  if (ctx.chat?.type === "private") {
    return startAction(ctx, bot);
  } else await cacheAction(ctx, bot);
  return next();
});

bot.on("text", async (ctx, next) => {
  // respond to messages that start with pup without the slash
  if (ctx.message?.text.startsWith("pup ")) {
    ctx.message.text = ctx.message.text.replace("pup ", "");
    return startAction(ctx, bot);
  }
  if (
    // random message 10% of the time
    (!ctx.message?.text.startsWith("/") && Math.random() < 0.1)
  ) {
    return startAction(ctx, bot);
  }
  return next();
});

bot.command("hoomanize", (ctx) => {
  return startAction(ctx, bot);
});

bot.command("mint", (ctx) => {
  return instantiateCw20Action(ctx, bot);
});

bot.command("send", (ctx) => {
  console.log("sending!");
  return transferCw20Action(ctx, bot);
});

bot.command("address", (ctx) => {
  return getAddressAction(ctx, bot);
});

bot.command("pup", (ctx) => {
  return startAction(ctx, bot);
});

export const handler = async (event) => {
  try {
    await Promise.race([
      bot.handleUpdate(JSON.parse(event.body)),
      new Promise((resolve) => setTimeout(resolve, 9000)),
    ]);
    return { statusCode: 200, body: "" };
  } catch (e) {
    console.log(e);
    return {
      statusCode: 400,
      body: "This endpoint is meant for bot and telegram communication",
    };
  }
};
