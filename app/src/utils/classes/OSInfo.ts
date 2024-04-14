import os from 'os';
import fs from 'fs';

export class OSInfo {
  public distribution:string|undefined;
  public platform = os.platform();
  public release = os.release();
  constructor(){
    switch(this.platform){
      case 'linux': {
        this.release = fs.readFileSync('/etc/os-release', 'utf8');
        if(this.release.toLowerCase().includes('ubuntu')){
          this.distribution = 'ubuntu';
        }
      } break;
      case 'win32': {
      } break;
    }
  }
}