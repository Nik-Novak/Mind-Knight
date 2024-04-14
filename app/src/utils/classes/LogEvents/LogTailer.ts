import TailLinux from '../LineListeners/TailLinux';
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
    let lineListener:LineListener|undefined;
    let osInfo = new OSInfo();
    switch (osInfo.platform){
      case 'linux': {
        lineListener = new TailLinux(this.logpath);
      } break;
      case 'win32': {
        lineListener = new TailWindows(this.logpath);
      } break;
    }
    if(!lineListener)
        throw Error('Unsupported platf');
    this.start(lineListener);
  }
}

export default new LogTailer();