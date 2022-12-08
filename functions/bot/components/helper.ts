import { TelegrafContext } from "telegraf/typings/context"

exports.getUser = (info: TelegrafContext['from']) => {
  info = info!
  const { id, is_bot: isBot, first_name: firstName = '', last_name: lastName = '' } = info
  const name = ((firstName || '') + ' ' + (lastName || '')).trim()
  const username = info.username || ''
  return { id, isBot, name, username }
}