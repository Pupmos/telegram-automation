export const handler = async event => {
  try {
    return { statusCode: 200, body: 'Add token to wallet' };
  } catch (e) {
    console.log(e)
    return { statusCode: 400, body: 'This endpoint is meant for bot and telegram communication' };
  }
}