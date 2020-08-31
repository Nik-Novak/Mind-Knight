//@ts-check
const { exec } = require('child_process');
const fs = require('fs');
const axios = require('axios').default;

class Version {
  constructor(localPath, remotePath){
    this.localPath = localPath;
    this.remotePath = remotePath;
  }

  checkVersion(){
      // @ts-ignore
      return new Promise( (resolve, reject) =>{
          fs.readFile(this.localPath, 'utf-8',(err, local) => {
              if (err) {
                  console.log('[ERROR] failed to read version file.')
                  local = 'unknown';
              };
              axios.get(this.remotePath)
                .then(response=>resolve({local, remote:response.data}))
                .catch(err=>resolve({local, remote:'unknown'}));
          });
      });
  }
  
  reinstall(){
    exec('cd .. && start ./REINSTALL.bat', (err, stdout, stderr) => {
        if (err) throw err;
        log(stdout);
    });
    setTimeout(()=>{
      console.log('Reinstall started, exiting current process.');
      process.exit();
    }, 500);
  }

  update(){
    exec('cd .. && start ./UPDATE.bat', (err, stdout, stderr) => {
      if (err) throw err;
      log(stdout);
    });
    setTimeout(()=>{
      console.log('Update started, exiting current process.');
      process.exit();
    }, 500);
  }
}

function log(msg){
    console.log('[CHILD PROCESS]',msg);
}

module.exports = {
    Version
}