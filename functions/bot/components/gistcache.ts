import { Octokit } from "@octokit/core";
import { Message } from "telegraf/typings/telegram-types";
type State = Map<string, Message>


const octokit = new Octokit({ auth: process.env.GITHUB_GIST_TOKEN });
const loadState = async (): Promise<State> => {
    const gist = await octokit.request(
        "GET /gists/1059832a999c70d9d1b662b546f95003",
        {
            gist_id: "1059832a999c70d9d1b662b546f95003",
        }
    );

    const currentState = JSON.parse(
        gist.data.files["pupmos-telegram-messages.json"].content
    );
    return new Map(currentState);
};

const updateState = async (nextState: State) => {
    await octokit.request("PATCH /gists/1059832a999c70d9d1b662b546f95003", {
        gist_id: "1059832a999c70d9d1b662b546f95003",
        description: "description",
        files: {
            [`pupmos-telegram-messages.json`]: {
                content: JSON.stringify([...nextState].slice(-10)),
            },
        },
    });
}

export const setItem = async (key: string, value: Message) => {
    const current = await loadState();
    current.set(key, value);
    updateState(current)
}

export const getItem = async (key: string) => {
    const state = await loadState();
    return state.get(key);
}