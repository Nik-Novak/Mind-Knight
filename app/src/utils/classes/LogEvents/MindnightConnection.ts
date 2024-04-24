import { LogEvents, LogReceiveEventCodes, LogReceiveEvents, LogSendEventCodes, LogSendEvents, getLogReceiveType, getLogSendType } from "@/types/events";
import { JsonObject } from "@prisma/client/runtime/library";
import EventEmitter from "events";
import { WriteStream, fstat } from "fs";
import fs from 'fs';
import { SocketConnection } from "./SocketConnection";

export class MindnightConnection extends EventEmitter<LogEvents>{
  private mindnightWs:SocketConnection;
  private logStream:WriteStream;
  constructor(logPath:string){
    super();
    if(!process.env.MINDNIGHT_WS) throw Error('Must provide env MINDNIGHT_WS');
    this.mindnightWs = new SocketConnection(process.env.MINDNIGHT_WS);
    this.mindnightWs.addEventListener('message', (ev)=>this.processPacket(ev));
    this.logStream = fs.createWriteStream(logPath, {encoding:'utf8'});
  }

  sendToMindnight(packet: LogSendEvents[keyof LogSendEvents]['0']) {
    this.mindnightWs.send(packet);
    let packetType = getLogSendType(packet.Type);
    this.logStream.write(`${this.logFormatDate(new Date())}: Sending ${packetType}Packet:${JSON.stringify(packet)}\n`);
  }

  private processPacket(ev:MessageEvent<any>){
    try{
      let packet = JSON.parse(ev.data.toString());
      let log_time = new Date();
      let packetType = getLogReceiveType(packet.Type);
      this.emit(packetType, packet, log_time);
      this.logStream.write(`${this.logFormatDate(log_time)}: Received ${packetType} packet:${ev.data.toString()}\n`);
    } catch(err){
      if(err instanceof SyntaxError){
        console.log('ERROR parsing JSON from packet.');
        console.log('\tPacket:', ev.data.toString());
      }
    }
  }

  private logFormatDate(date:Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;
  }
}