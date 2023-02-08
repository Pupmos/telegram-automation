import { Octokit } from "@octokit/core";
import { Message } from "telegraf/typings/telegram-types";


type Value = {
    chatId: number;
    message: Message;
}[]

type State = Map<string, Value>;

const octokit = new Octokit({ auth: process.env.GITHUB_GIST_TOKEN });
const loadState = async (): Promise<State> => {
    const gist = await octokit.request(
        "GET /gists/82084d1d994e88cf5b77bbcb76840262",
        {
            gist_id: "82084d1d994e88cf5b77bbcb76840262",
        }
    );
    const currentState = JSON.parse(
        gist.data.files["chat-revival-log.json"].content
    );
    return new Map(currentState);
};

const updateState = async (nextState: State) => {
    await octokit.request("PATCH /gists/82084d1d994e88cf5b77bbcb76840262", {
        gist_id: "82084d1d994e88cf5b77bbcb76840262",
        description: "description",
        files: {
            [`chat-revival-log.json`]: {
                content: JSON.stringify([...nextState].slice(-10)),
            },
        },
    });
}

export const setItem = async (key: string, value: Value) => {
    const current = await loadState();
    current.set(key, value);
    await updateState(current)
}

export const getItem = async (key: string) => {
    const state = await loadState();
    return state.get(key);
}