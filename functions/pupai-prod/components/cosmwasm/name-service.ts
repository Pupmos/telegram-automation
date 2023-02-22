import { CosmWasmClient, fromBase64, toHex } from "cosmwasm";
import { connect } from "./connect";
import { junoConfig, osmoConfig, stargazeConfig } from "./networks";
import { fetch } from "cross-fetch";
export async function nameService(address: string) {
  const osmoClient = await CosmWasmClient.connect(osmoConfig.rpcEndpoint);
  const res = await osmoClient
    .queryContractSmart(
      "osmo1xk0s8xgktn9x5vwcgtjdxqzadg88fgn33p8u9cnpdxwemvxscvast52cdd",
      {
        icns_names: { address },
      }
    )
    .catch((e) => {
      return {};
    });
  const { primary_name: osmoName } = res;
  const starsClient = await CosmWasmClient.connect(stargazeConfig.rpcEndpoint);
  const starsName = await starsClient
    .queryContractSmart(
      "stars1fx74nkqkw2748av8j7ew7r3xt9cgjqduwn8m0ur5lhe49uhlsasszc5fhr",
      {
        name: { address },
      }
    )
    .catch((e) => {
      return undefined;
    });
  const junoClient = await CosmWasmClient.connect(junoConfig.rpcEndpoint);
  const account = await junoClient.getAccount(address);
  let daodaoName: string | undefined;
  if (account !== null && account.pubkey !== null) {
    const pubkey = toHex(fromBase64(account.pubkey.value));
    const { name } = await fetch(`https://pfpk.daodao.zone/${pubkey}`).then(
      (r) => r.json()
    );
    daodaoName = name;
  }
  return daodaoName || starsName || osmoName;
}
