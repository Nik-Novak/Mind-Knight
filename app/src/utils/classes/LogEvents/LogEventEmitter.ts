import { LogEvents } from "@/types/events";
import EventEmitter from "events";
import { OSInfo } from "../OSInfo";
import LineListener from "../LineListeners/LineListener";
import { logLineToISOTime } from "@/utils/functions/game";
import fs from 'fs';

export default class LogEventEmitter extends EventEmitter<LogEvents> {
  protected logpath = '';
  protected prevLogpath = '';

  constructor(){
    super();
    let osInfo = new OSInfo();
    switch(osInfo.platform){
      case 'linux': {
        if(osInfo.distribution?.includes('ubuntu')){
          this.logpath = `${process.env.HOME}/snap/steam/common/.config/unity3d/Nomoon/Mindnight/Player.log`;
          this.prevLogpath = `${process.env.HOME}/snap/steam/common/.config/unity3d/Nomoon/Mindnight/Player-prev.log`;
          // this.tail = new TailLinux(this.logpath);
        }
      } break;
      case 'win32': {
        this.logpath = `${process.env.USERPROFILE}/appdata/LocalLow/Nomoon/Mindnight/Player.log`;
        this.prevLogpath = `${process.env.USERPROFILE}/appdata/LocalLow/Nomoon/Mindnight/Player-prev.log`;
        // this.tail = new TailWindows(this.logpath);
      } break;
    }
    if(!this.logpath)
      throw Error(`Sorry, Mind Knight does not yet support your platform: ${osInfo.platform} ${osInfo.release}.\nClick here to request support: ${process.env.NEXT_PUBLIC_SUPPORT_URL}`);
  }

  start(lineListener:LineListener){
    lineListener.addListener((line)=>{
      // console.log(line);
      try{
        if(!line.trim())
          return;
        if(line.includes('Initialize engine version'))
          this.emit('GameLaunch', new Date()); //don't use this timestamp, inconsistent
        else if(line.includes('GlobalChatHisotryRequest')){ //cmon marcel, why u gotta make my life hard. lol
          console.log('FOUND PACKET', 'GlobalChatHisotryRequest');
          console.log('\t', JSON.parse(line.substring(line.toLowerCase().indexOf('packet:', 20) + 7)));
          this.emit('GlobalChatHistoryRequest', JSON.parse(line.substring(line.toLowerCase().indexOf('packet:', 20) + 7)), logLineToISOTime(line));
        }
        else if(line.includes('Connection was closed'))
          this.emit('GameClose', logLineToISOTime(line))
        else { //check for `Received .* packet:` pattern.
          let packetType = /Received (.*) packet:/i.exec(line)?.[1].trim() as keyof LogEvents | undefined; //catch all Received packets
          if(!packetType)
            packetType = /Sending (.*)Packet:/i.exec(line)?.[1].trim() as keyof LogEvents | undefined; //catch all Sending packets
          if(packetType){
            // if((['ReceiveGlobalChatMessage', 'PlayerInfo', 'AuthResponse']).includes(packetType))
            console.log(`FOUND PACKET`, packetType)
            let packet = JSON.parse(line.substring(line.toLowerCase().indexOf('packet:', 20) + 7).trim());// as LogEvents[keyof LogEvents]['0'];
            if((['ReceiveGlobalChatMessage', 'PlayerInfo', 'AuthResponse', 'GameEnd', 'SpawnPlayer']).includes(packetType))
              console.log('\t', packet);
            this.emit(packetType, packet, logLineToISOTime(line));
          }
        }
      } catch(err){
        if(err instanceof SyntaxError){
          console.log('ERROR parsing JSON.')
          console.log('\tLine:', line);
        }
        throw err;
      }
    })
    .start();
  }

  readLog(){
    return fs.readFileSync(this.logpath, 'utf8');
  }
  readPrevLog(){
    return fs.readFileSync(this.prevLogpath, 'utf8');
  }
}