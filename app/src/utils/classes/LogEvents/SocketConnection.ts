import { JsonObject } from "@prisma/client/runtime/library";

type KeepAlivePacket = {Type:-1};

export class SocketConnection extends WebSocket {
  private ws:WebSocket|undefined;
  constructor(wsUrl:string, protocols?:string|string[]){
    super(wsUrl,protocols);
    let keepAlivePacket:KeepAlivePacket = {Type:-1};
    this.send(keepAlivePacket);
  }

  send(packet: string | ArrayBufferLike | Blob | ArrayBufferView | JsonObject) {
    return new Promise<void>((resolve, reject)=>{
      if(this.ws === undefined || this.ws.readyState === WebSocket.CLOSED || this.ws.readyState === WebSocket.CLOSING){
        this.ws = new WebSocket(process.env.MINDNIGHT_WS!);
        this.ws.addEventListener('open', ()=>{ //standard opening sequence
          console.log(`Successfully connected to ${this.url}.`);
          let keepAlivePacket:KeepAlivePacket = {Type:-1};
          setInterval(()=>this.send(keepAlivePacket), 10_000);
        });
        this.ws.addEventListener('open', ()=>this.send(packet).then(resolve)); //queue the packet send
        this.ws.addEventListener('close', async (ev)=>{
          console.log(`Disconnected from ${this.url}, reason: ${ev.reason}`);
        });
      }
      else if(this.ws.readyState === WebSocket.OPEN) { //connected, simply send
        this.ws.send(JSON.stringify(packet));
        return resolve();
      }
      else if(this.ws.readyState === WebSocket.CONNECTING) { //not open yet, queue the packet send
        this.ws.addEventListener('open', ()=>this.send(packet).then(resolve));
        return resolve();
      }
      else return reject("Something went horribly wrong");
    });
  }
}