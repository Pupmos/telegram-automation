import Telegraf from "telegraf"
import { TelegrafContext } from "telegraf/typings/context"
import fetch from 'cross-fetch';

async function loadSupply(symbol: string) {
  const { data: tokenStats } = await fetch(`https://unisat.io/brc20-api-v2/brc20/${symbol.toUpperCase()}/info`, {
    "headers": {
      "accept": "application/json, text/plain, */*",
    },
  }).then(r => r.json());
  return {
      confirmed: +tokenStats.confirmedMinted
  }
}

async function loadPriceData(symbol: string) {
  const splitCase = s => !s || s.indexOf(' ') >= 0 ? s :
  (s.charAt(0).toUpperCase() + s.substring(1))
      .split(/(?<=[a-z])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])/g)
      .map(x => x.replace(/([0-9]+)/g,'$1 '))
      .join(' ');
  const brc20Data = await fetch("https://market-api.unisat.io/unisat-market-v2/auction/brc20_types", {
    "headers": {
      "accept": "application/json, text/plain, */*",
      "content-type": "application/json"
    },
    "body": "{}",
    "method": "POST",
  })
      .then(r => r.json())
      .then(r => r.data);

  const btcPrice = brc20Data.BTCPrice;
  const tokenData = brc20Data.list.find(
      brc20 => brc20.tick.toLowerCase() == symbol.trim().toLowerCase()
  );
  const usdPrice = (btcPrice / 100000000) * tokenData.curPrice;
  const supply = await loadSupply(symbol);
  return `Price:\n\t${tokenData.curPrice} sats \n\t$${new Intl.NumberFormat().format(usdPrice)} USD\nMarket Cap:\n\t${supply.confirmed * tokenData.curPrice} sats\n\t$${new Intl.NumberFormat().format(usdPrice * supply.confirmed)} USD`
}

export const brc20Action = async (ctx: TelegrafContext, bot: Telegraf<TelegrafContext>) => {
  if (!ctx.message) return console.error('no message! failed!');
  try {
    const ticker = ctx.message!.text.trim().split(' ').pop()!;
    const price = await loadPriceData(ticker);
    return ctx.replyWithMarkdownV2(`\`${ticker.toUpperCase()}: \n${price}\``, {
      reply_to_message_id: ctx.message!.message_id,
      allow_sending_without_reply: true
    })
  } catch(e) {
    return ctx.replyWithMarkdownV2(`\`"Failed to load ticker data."\``, {
      reply_to_message_id: ctx.message!.message_id,
      allow_sending_without_reply: true
    })
  }
  
}
