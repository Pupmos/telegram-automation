import Anthropic from "@anthropic-ai/sdk";
import { TextBlock } from "@anthropic-ai/sdk/resources";
import { Octokit } from "@octokit/core";
import fetch from "cross-fetch";

const CACHE_TIMEOUT = 5 * 60_000;

const octokit = new Octokit({ auth: process.env.GITHUB_GIST_TOKEN });

const loadTrainingSample = (() => {
  let data: any;
  let lastUpdated = 0;
  const loadData = async (): Promise<any> => {
    const gist = await octokit.request(
      "GET /gists/95b2324aa0d55b7bdf0a44a1bfb7a028",
      {
        gist_id: "95b2324aa0d55b7bdf0a44a1bfb7a028",
      }
    );
    return gist.data.files["openai-training-samples.txt"].content;
  };
  return async () => {
    if (Date.now() - lastUpdated > CACHE_TIMEOUT) {
      data = await loadData();
    }
    return data;
  };
})();

export const translate = async function handler(
  text: string,
  name: string,
  increaseInnocence = false
) {
  const processText = async (text) => {
    text = text.replace("/hoomanize ", "");
    let formattedText = text.replace("/pup ", "");
    const dogModifier = increaseInnocence ? ` (very innocent)` : "";
    const sampleText =
      formattedText == text
        ? `dog (named ${name}): "${text}"\nhuman: `
        : `human (named ${name}): "${formattedText}"\ndog${dogModifier}:`;

    console.log(process.env.AHTHROPIC);
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      // @ts-ignore
      apiToken: process.env.ANTHROPIC_API_KEY,
    });

    const res = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      // max_tokens: 1024,
      max_tokens: 450,
      messages: [
        { role: "user", content: `${await loadTrainingSample()}${sampleText}` },
      ],
    });

    let content = res.content[0]! as TextBlock;
    let txt = content.text;
    // certain markdown characters break telegram https://stackoverflow.com/a/71313944
    try {
      // if in quotes, dequote
      txt = JSON.parse(txt);
    } catch (e) {}

    try {
      // remove starting and ending quote
      txt = txt.replace(/^"|"$/g, "");
    } catch (e) {}

    return txt
      .replace("\n\n", "")
      .replace(/\_/g, "\\_")
      .replace(/\*/g, "\\*")
      .replace(/\[/g, "\\[")
      .replace(/\]/g, "\\]")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)")
      .replace(/\~/g, "\\~")
      .replace(/\`/g, "\\`")
      .replace(/\>/g, "\\>")
      .replace(/\#/g, "\\#")
      .replace(/\+/g, "\\+")
      .replace(/\-/g, "\\-")
      .replace(/\=/g, "\\=")
      .replace(/\|/g, "\\|")
      .replace(/\{/g, "\\{")
      .replace(/\}/g, "\\}")
      .replace(/\./g, "\\.")
      .replace(/\!/g, "\\!");
  };
  try {
    let result = await processText(text).catch(() =>
      processText(
        `If i muttered '${text}' incomprehenzibly. how would u rezpond? try to uze my name in the rezponze.`
      )
    );
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
    return "error:" + responses[Math.floor(Math.random() * responses.length)];
  }
};
