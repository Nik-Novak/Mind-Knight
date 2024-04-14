import Tail from '../LineListeners/Tail';
import TailWindows from '../LineListeners/TailWindows';
import LineListener from '../LineListeners/LineListener';
import { OSInfo } from '../OSInfo';
import LogEventEmitter from './LogEventEmitter';

/**
 * Subscribes to log based on platform and emits events
 */
class LogTailer extends LogEventEmitter{
  constructor(){
    super();
    let lineListener:LineListener;
    let osInfo = new OSInfo();
    switch (osInfo.platform){
      case 'win32': {
        lineListener = process.env.COMPATIBILITY_MODE ? new Tail(this.logpath, {useWatchFile:true}) : new TailWindows(this.logpath);
      } break;
      default: lineListener = new Tail(this.logpath);
    }
    
    this.start(lineListener);
  }
}

export default new LogTailer();