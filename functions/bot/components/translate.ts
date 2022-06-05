import { Configuration, OpenAIApi } from "openai";
import * as fs from "fs";
import * as path from "path";
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

export const translate = async function handler(text: string) {
  try {
    const trainingText = fs.readFileSync(
      path.join(path.resolve(process.cwd(), "data"), "training.txt")
    );
    const sampleText = `dog: "${text}"\nhuman: `;
    const response = await openai.createCompletion("text-davinci-002", {
      prompt: `${trainingText}${sampleText}`,
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