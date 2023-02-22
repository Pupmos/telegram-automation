import { Octokit } from "@octokit/core";
import fetch from "cross-fetch";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const CACHE_TIMEOUT = 5 * 60_000;

const octokit = new Octokit({ auth: process.env.GITHUB_GIST_TOKEN });

const loadTrainingSample = (() => {
  let data: any;
  let lastUpdated = 0;
  const loadData = async (): Promise<any> => {
    const gist = await octokit.request(
      "GET /gists/c94317654cfcff343e894a50fb71a035",
      {
        gist_id: "c94317654cfcff343e894a50fb71a035",
      }
    );
    return gist.data.files["pupai-training-data.txt"].content;
  };
  return async () => {
    if (Date.now() - lastUpdated > CACHE_TIMEOUT) {
      data = await loadData();
    }
    return data;
  };
})();

export const queryGPT = async function handler(
  text: string,
  name: string,
  increaseInnocence = false
) {
  const process = async (text) => {
    const isDog = true;
    const sampleText = `

<!-- PUPAI JOB SAMPLE (submitted by ${name}) -->
${text}

<!-- PUPAI OUTPUT SAMPLE -->`;
    const response = await openai.createCompletion("text-davinci-003", {
      prompt: `${await loadTrainingSample()}${sampleText}`,
      temperature: 0.7,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });
    const resText = response.data.choices?.[0].text;
    // certain markdown characters break telegram https://stackoverflow.com/a/71313944
    return resText!;
    // .replace(/\_/g, "\\_")
    // .replace(/\*/g, "\\*")
    // .replace(/\[/g, "\\[")
    // .replace(/\]/g, "\\]")
    // .replace(/\(/g, "\\(")
    // .replace(/\)/g, "\\)")
    // .replace(/\~/g, "\\~")
    // .replace(/\`/g, "\\`")
    // .replace(/\>/g, "\\>")
    // .replace(/\#/g, "\\#")
    // .replace(/\+/g, "\\+")
    // .replace(/\-/g, "\\-")
    // .replace(/\=/g, "\\=")
    // .replace(/\|/g, "\\|")
    // .replace(/\{/g, "\\{")
    // .replace(/\}/g, "\\}")
    // .replace(/\./g, "\\.")
    // .replace(/\!/g, "\\!");
  };
  try {
    let result = await process(text);
    return result;
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
      console.log("Error", e.message);
    }
    console.log(e.config);

    const responses = [
      "esscuze me butt i am nappin. u can not hav da zoomiez wifout da snooziez 🌭",
      "im ztil alive butt im barely breavin",
      "i am zo zleepy",
      "i can zee da lite. it iz bootifol.",
      "da warm embraze. it feelz lyke i am goin hoam",
      "deafh smilez upon uz. all a pup can do iz zmile bacc.",
      "it iz the fear ov da snooziez da keepz uz alibe.",
      "i will hav da courag in da snooziez dat mozt never hav in da zoomiez.",
      "i am puppared 2 meat my makor. az long az my maker alzo makez treetz. hehe",
      "i am undergoin the operation for the next few hourz. pleez wizh me lucc.",
      "IIIII WILL ALWAYZ LOVB UUUUUUUUUUUUU. buttt i am zleepin rite nøw",
      "stahp azkin me queztionz. i am catchin pup on some snooziez.",
      "all deez queztionz r makin me berrie zleepy.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
};
