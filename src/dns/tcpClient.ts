import { Client as Base, TCPSocket } from "bns/lib/internal/net.js";
import IP from "binet";
import { Duplex } from "streamx";
import { MultiSocketProxy } from "@lumeweb/libhyperproxy";
import defer from "p-defer";

class Stream extends Duplex {
  public remoteAddress = "127.0.0.1";
  public family = "IPv4";
  public port = 0;
  public remotePort = 0;
  public parent: any;

  constructor(options) {
    super(options);
    this.parent = options.parent;
  }

  setNoDelay() {}

  connect() {
    setTimeout(() => {
      // @ts-ignore
      this.emit("connect");
    }, 1);
  }

  unref() {}
}

const PROTOCOL = "lumeweb.proxy.handshake.dns";

export default class TCPClient extends Base {
  private node: any;
  private proxy: MultiSocketProxy;
  private peerConnected = defer();

  constructor(options) {
    super(options);

    this.node = options.node;
    this.proxy = new MultiSocketProxy({
      protocol: PROTOCOL,
      swarm: options.swarm,
      server: false,
      autostart: true,
      listen: true,
    });

    this.proxy.on("peerChannelOpen", () => {
      this.peerConnected.resolve();
    });
  }

  protected declare sockets: Map<any, any>;

  async write(msg, port, host) {
    const local = host === "127.0.0.1";
    const key = IP.toHost(host, port);
    const cache = this.sockets.get(key);

    if (cache) {
      cache.write(msg);
      return;
    }

    let socket: any = null;

    try {
      if (local) {
        socket = await this.createLocalSocket();
      } else {
        await this.peerConnected.promise;
        socket = new TCPSocket(this);
        socket.socket = this.proxy.createSocket({
          host,
          port,
        });
        socket.socket.remoteAddress = host;
        socket.socket.remotePort = port;

        await socket.connect();
      }
    } catch (e) {
      return;
    }

    if (this.sockets.has(key)) {
      socket.destroy();
      socket = this.sockets.get(key);
    } else {
      socket.parent = this;
      this.sockets.set(key, socket);
    }

    socket.write(msg);
  }

  async createLocalSocket() {
    const socket = new TCPSocket(this);
    const remoteSocket = new Stream({
      parent: this,
      write: (data, cb) => {
        // @ts-ignore
        socket.socket.push(data);
        cb?.(null);
      },
    });
    // @ts-ignore
    socket.socket = new Stream({
      parent: this,
      write: (data, cb) => {
        // @ts-ignore
        remoteSocket.push(data);
        cb?.(null);
      },
    });
    const port = this.node.rs.hns.getAuthority().servers.slice().pop().port;
    remoteSocket.port = port;
    remoteSocket.remotePort = port;
    // @ts-ignore
    socket.socket.port = port;
    // @ts-ignore
    socket.socket.remotePort = port;

    await socket.connect();

    this.node.ns.server.server.emit("connection", remoteSocket);

    return socket;
  }
}
