import { Octokit } from "@octokit/core";
import fetch from "cross-fetch";
import { Configuration, OpenAIApi } from "openai";
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);


const octokit = new Octokit({ auth: process.env.GITHUB_GIST_TOKEN });
const loadTrainingSample = async (): Promise<any> => {
    console.error()
    const gist = await octokit.request(
        "GET /gists/95b2324aa0d55b7bdf0a44a1bfb7a028",
        {
            gist_id: "95b2324aa0d55b7bdf0a44a1bfb7a028",
        }
    );
    return gist.data.files["openai-training-samples.txt"].content
};

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
    if (e.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(e.response.data);
        console.log(e.response.status);
        console.log(e.response.headers);
      } else if (e.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(e.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', e.message);
      }
      console.log(e.config);
    return 'failed to translate'
  }
}
