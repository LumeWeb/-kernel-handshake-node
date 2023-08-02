import type { ActiveQuery } from "@lumeweb/libkernel/module";
import { addHandler, handleMessage } from "@lumeweb/libkernel/module";
import { createClient as createSwarmClient } from "@lumeweb/kernel-swarm-client";
import { createClient as createNetworkRegistryClient } from "@lumeweb/kernel-network-registry-client";
import {
  createServer,
  DummySocket,
  MultiSocketProxy,
} from "@lumeweb/libhyperproxy";
// @ts-ignore
import { SPVNode } from "hsd/lib/node";
import defer from "p-defer";
import dns from "@i2labs/dns";
import assert from "assert";
import { wire } from "bns";
import TCPClient from "./dns/tcpClient.js";

const PROTOCOL = "lumeweb.proxy.handshake";
const TYPES = ["blockchain"];

onmessage = handleMessage;

let moduleLoadedResolve: Function;
let moduleLoaded: Promise<void> = new Promise((resolve) => {
  moduleLoadedResolve = resolve;
});

addHandler("presentKey", handlePresentKey);
addHandler("register", handleRegister);
addHandler("status", handleStatus, { receiveUpdates: true });
addHandler("name", handleName);
addHandler("ready", handleReady);
addHandler("query", handleQuery);
addHandler("dnsQuery", handleDnsQuery);

let swarm;
let proxy: MultiSocketProxy;
let node: SPVNode;

const networkRegistry = createNetworkRegistryClient();

function resolveWithPeers(resolve: Function) {
  if (!node.pool.peers.head()) {
    node.pool.on("peer", () => {
      resolveWithPeers(resolve);
    });
    return;
  }

  let syncable = false;

  for (let peer = node.pool.peers.head(); peer; peer = peer.next) {
    if (node.pool.isSyncable(peer)) {
      syncable = true;
      break;
    }
  }

  if (!syncable) {
    for (let peer = node.pool.peers.head(); peer; peer = peer.next) {
      const listener = () => {
        peer.off("open", listener);
        resolve();
      };
      peer.on("open", listener);
    }
    return;
  }

  return resolve(null);
}

async function handlePresentKey(aq: ActiveQuery) {
  swarm = createSwarmClient();

  const peerConnected = defer();
  node = new SPVNode({
    config: false,
    argv: false,
    env: false,
    memory: false,
    logFile: false,
    logConsole: true,
    logLevel: "info",
    workers: true,
    network: "main",
    createServer,
    createSocket: (port: number, host: string) => {
      const socket = proxy.createSocket({
        host,
        port,
      }) as unknown as DummySocket;
      socket.connect();

      return socket;
    },
  });

  node.pool.hosts.resolve = async (host: any, family?: any) => {
    if (family == null) family = null;

    assert(family === null || family === 4 || family === 6);

    const stub = new dns.promises.Resolver();

    stub.setServers([
      // Cloudflare
      "1.1.1.1",
      // Google
      "8.8.8.8",
      "8.8.4.4",
      // OpenDNS
      "208.67.222.222",
      "208.67.220.220",
      "208.67.222.220",
      "208.67.220.222",
    ]);

    const out: string[] = [];
    const types: string[] = [];

    if (family == null || family === 4) types.push("A");

    if (family == null || family === 6) types.push("AAAA");

    for (const type of types) {
      let addrs;

      try {
        addrs = await stub.resolve(host, type as any);
      } catch (e) {
        continue;
      }

      // @ts-ignore
      out.push(...addrs);
    }

    if (out.length === 0) throw new Error("No DNS results.");

    return out;
  };

  if (node?.http?.http?.listen) {
    node.http.http.listen = (port: number, host: string, cb: Function) => cb();
  }

  node.rs.hns.forceTCP = true;
  node.rs.hns.socket = new TCPClient({ node, swarm });
  node.rs.hns.init();

  proxy = new MultiSocketProxy({
    protocol: PROTOCOL,
    swarm,
    server: false,
    autostart: true,
    listen: true,
  });

  proxy.on("peerChannelOpen", () => {
    peerConnected.resolve();
  });

  await swarm.join(PROTOCOL);
  await swarm.start();

  await peerConnected.promise;

  await node.open();
  await node.connect();
  await node.startSync();

  moduleLoadedResolve();
}

async function handleReady(aq: ActiveQuery) {
  await moduleLoaded;

  await new Promise((resolve): void => {
    if (node.chain.synced) {
      return resolveWithPeers(resolve);
    }

    node.pool.once("full", () => {
      resolveWithPeers(resolve);
    });
  });

  aq.respond();
}

async function handleQuery(aq: ActiveQuery) {
  if (!node.chain.synced || !node.pool.peers.head()) {
    aq.reject("not ready");
    return;
  }

  try {
    aq.respond(await node.rpc.call(aq.callerInput));
  } catch (e) {
    aq.reject((e as Error).message);
  }
}

async function handleDnsQuery(aq: ActiveQuery) {
  if (!node.chain.synced || !node.pool.peers.head()) {
    aq.reject("not ready");
    return;
  }

  if (!("fqdn" in aq.callerInput)) {
    aq.reject("fqdn required");
    return;
  }

  if (!("type" in aq.callerInput)) {
    aq.reject("type required");
    return;
  }

  const msg = new wire.Message();
  const q = new wire.Question(aq.callerInput.fqdn, aq.callerInput.type);
  msg.question.push(q);

  const ret = await node.rs.answer(msg);

  aq.respond(
    ret.collect(aq.callerInput.fqdn, wire.stringToType(aq.callerInput.type)),
  );
}

async function handleRegister(aq: ActiveQuery) {
  await networkRegistry.registerNetwork(TYPES);

  aq.respond();
}

async function handleStatus(aq: ActiveQuery) {
  let chainProgress = node.chain.getProgress();
  let chainPeers = node.pool.peers.size();

  const chainProgressListener = node.chain.on("tip", () => {
    chainProgress = node.chain.getProgress();
    sendUpdate();
  });

  function peersListener() {
    chainPeers = node.pool.peers.size();
    sendUpdate();
  }

  node.pool.on("peer", peersListener);
  node.pool.on("peer close", peersListener);

  function sendUpdate() {
    aq.sendUpdate({
      sync: chainProgress * 100,
      peers: chainPeers,
      ready: node.chain.synced,
    });
  }

  aq.setReceiveUpdate?.(() => {
    node.chain.removeListener("tip", chainProgressListener);
    node.pool.off("peer", peersListener);
    node.pool.off("peer close", peersListener);
    aq.respond();
  });

  sendUpdate();
}

function handleName(aq: ActiveQuery) {
  aq.respond("Handshake");
}
