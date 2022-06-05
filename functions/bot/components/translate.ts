import fetch from "cross-fetch";
import { Configuration, OpenAIApi } from "openai";
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

const loadTrainingSample = async () => {
    return fetch('https://gist.githubusercontent.com/siriustaikun/95b2324aa0d55b7bdf0a44a1bfb7a028/raw/248bd738f4ceab28a4e90ef89f6c7af689fcea0f/openai-training-samples.txt').then(r => r.text())
}

export const translate = async function handler(text: string) {
  try {

    const sampleText = `dog: "${text}"\nhuman: `;
    const response = await openai.createCompletion("text-davinci-002", {
      prompt: `${await loadTrainingSample()}${sampleText}`,
      temperature: 0,
      max_tokens: 147,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0
    });
    return JSON.parse(response.data.choices[0].text.replace("\n\n", ""));
  } catch (e) {
    console.error(e);
    return 'failed to translate'
  }
}
