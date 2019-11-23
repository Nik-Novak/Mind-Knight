var fs = require('fs-extra');
var os = require('os');
const {
    execSync
} = require('child_process');
var firebase = require('firebase');


class Database {
    constructor() {
        var config = {
            apiKey: "AIzaSyB_9ThuNp1E4gqjhcnJScNc1IqGwN4vZHA",
            authDomain: "mind-knight.firebaseapp.com",
            databaseURL: "https://mind-knight.firebaseio.com",
            projectId: "mind-knight",
            storageBucket: "mind-knight.appspot.com",
            messagingSenderId: "642449351902"
        };

        var app = firebase.initializeApp(config);
        this.firebase = firebase;
        this.fileCheckpoint = 0;
        //firebase.initializeApp(config);

        // var connectedRef = this.firebase.database().ref(".info/connected");
        // connectedRef.on("value", function(snap) {
        // if (snap.val() === true) {
        //     console.log(`[DEBUG] DB connected.`)
        // } else {
        //     console.log(`[DEBUG ERROR] No DB connection.`)
        // }
        // });
    }

    uploadGame(filepath) {
        let data = this.readLogFile(filepath);
        let tmp = data.length; //store the legtnh of the file as a checkpoint
        data = data.substring(this.fileCheckpoint);
        let UUID = this.getID();
        this.fileCheckpoint=tmp;
        this.uploadData(UUID, data);
    }
    
    resetCheckpoint(){
        this.fileCheckpoint=0;
    }

    readLogFile(filepath) {
        let data = fs.readFileSync(filepath, "utf8", function (err) {
            if (err) {
                console.log("[ERROR] Error in reading log file to be uploaded \n" + err);
                return;
            }
        });

        console.log('Successfully read log file: \n');
        return data;
    }

    getID() {
        let stdout = execSync('wmic csproduct get UUID');
        return stdout.toString('utf8').split(os.EOL)[1].trim();
    }

    uploadData(UUID, data) {
        //        console.log(UUID);
        //        console.log(data);
        //this.firebase.ref()

        this.firebase.database().ref('users/' + UUID).once('value').then
        ( 
            snapshot => {
                //console.log(`[DEBUG] Database read successfully.`);
                //console.log(snapshot.val())
                let userdata = snapshot.val();
                if(userdata==null || userdata.length==0){
                    userdata = [];
                    console.log(`userdata was not found for UUID ${UUID}, generating empty userdata.`)
                }

                let recordsLen = userdata.length;
                //console.log(`[DEBUG] userdata.length - ${userdata.length}`)
                let newData = {
                    timestamp: Date.now(),
                    data: data
                }
                // userdata.push({
                //     timestamp: Date.now(),
                //     data: data
                // });
                
                this.firebase.database().ref('users/' + UUID + '/' + recordsLen).set(
                    newData, 
                    function(err){
                        if(err)
                            console.log(`[ERROR] ${err}`);
                        else
                            console.log(`[LOG] Game information successfully sent (${UUID}).`)
                    }
                );

            }, 
            
            function(err){
                console.log(err);
            }
        );

        //console.log(`[DEBUG] end of uploadData`)
        
//        let testdata = [
//            {timestamp: '123',data: '1234'},
//            {timestamp: '321',data: '4321'}
//        ]
//        this.firebase.database().ref('users/' + UUID).set(testdata);
        //        let test = this.firebase.database().ref('users').once('value').then(snapshot=>{
        //            console.log(snapshot.val());
        //        });
        //        console.log(test);
    }
}

module.exports = {
    Database: Database
}