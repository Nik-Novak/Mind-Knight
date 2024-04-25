import { JsonObject } from "@prisma/client/runtime/library";

type KeepAlivePacket = {Type:-1};

export class SocketConnection {
  public ws!:WebSocket;
  constructor(private wsUrl:string, private protocols?:string|string[]){
    this.init();
    let keepAlivePacket:KeepAlivePacket = {Type:-1};
    this.send(keepAlivePacket);
  }

  private init(){
    this.ws = new WebSocket(this.wsUrl, this.protocols);
    this.ws.addEventListener('open', ()=>{ //standard opening sequence
      console.log(`Successfully connected to ${this.ws.url}.`);
      let keepAlivePacket:KeepAlivePacket = {Type:-1};
      setInterval(()=>{
        this.send(keepAlivePacket); //console.log('SENT KEEPALIVE')
      }, 10_000);
    });
    // this.ws.addEventListener('open', ()=>this.send(packet).then(resolve)); //queue the packet send
    this.ws.addEventListener('close', async (ev)=>{
      console.log(`Disconnected from ${this.ws.url}, reason: ${ev.reason}`);
    });
  }

  send(packet: string | ArrayBufferLike | Blob | ArrayBufferView | JsonObject) {
    return new Promise<void>((resolve, reject)=>{
      if(this.ws === undefined || this.ws.readyState === WebSocket.CLOSED || this.ws.readyState === WebSocket.CLOSING){
        this.init();
        this.ws.addEventListener('open', ()=>this.send(packet).then(resolve)); //queue the packet send
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