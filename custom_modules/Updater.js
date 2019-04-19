const { exec } = require('child_process');

class Updater{
    constructor(){
        
    }
    
    update(){
        
        exec('UPDATE.bat', (err, stdout, stderr) => {
            if (err) throw err;
            log(stdout);
        });
        
        
//        exec('git pull', (err, stdout, stderr) => {
//            if (err) throw err;
////            set gitdir=c:\portablegit
////            set path=%gitdir%\cmd;%path%
//            console.log(stdout);
//        });
        
    }
}

function log(msg){
    console.log('\n[CHILD PROCESS]:\n');
    console.log(msg);
    console.log('\n[END CHILD PROCESS]\n')
}

module.exports = {
    Updater: Updater
}