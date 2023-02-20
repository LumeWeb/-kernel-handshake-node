import type { ActiveQuery } from "libkmodule";
import { addHandler, handleMessage } from "libkmodule";
import { createClient } from "@lumeweb/kernel-swarm-client";
import HandshakeProxy from "@lumeweb/hypercore-proxy-handshake";

const PROTOCOL = "lumeweb.proxy.handshake";

onmessage = handleMessage;

let moduleLoadedResolve: Function;
let moduleLoaded: Promise<void> = new Promise((resolve) => {
  moduleLoadedResolve = resolve;
});

addHandler("presentSeed", handlePresentSeed);
addHandler("ready", handleReady);
addHandler("query", handleQuery);

let swarm;
let proxy: HandshakeProxy;

function resolveWithPeers(resolve: Function) {
  if (!proxy.node.pool.peers.head()) {
    proxy.node.pool.once("peer", () => {
      resolve(null);
    });
    return;
  }

  return resolve(null);
}

async function handlePresentSeed(aq: ActiveQuery) {
  swarm = createClient();
  proxy = new HandshakeProxy({ swarm, listen: true });

  swarm.join(PROTOCOL);
  await swarm.start();

  moduleLoadedResolve();
}

async function handleReady(aq: ActiveQuery) {
  await moduleLoaded;

  await new Promise((resolve): void => {
    if (proxy.node.chain.synced) {
      return resolveWithPeers(resolve);
    }

    proxy.node.pool.once("full", () => {
      resolveWithPeers(resolve);
    });
  });

  aq.respond();
}

async function handleQuery(aq: ActiveQuery) {
  if (!proxy.node.chain.synced || !proxy.node.pool.peers.head()) {
    aq.reject("not ready");
    return;
  }

  try {
    aq.respond(await proxy.node.rpc.call(aq.callerInput));
  } catch (e) {
    aq.reject((e as Error).message);
  }
}
