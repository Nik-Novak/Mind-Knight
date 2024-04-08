LOGPATH=$HOME/snap/steam/common/.config/unity3d/Nomoon/Mindnight/Player.log

# Game Found to Game Start
echo '2024.04.07 19:47:38: Received GameFound packet:{"Type":102,"PlayerNumber":5,"Hacker":false,"GuyRole":10,"HackersAmount":2,"MissionInfo":[2,3,2,3,3],"MissionMinhacks":[1,1,1,1,1],"Hackers":[],"MatchType":0,"FirstPlayer":0,"Map":71,"Options":{"GameMode":0,"MaxPlayers":8,"Visibility":2,"NamingConvention":1,"HammerEnabled":true,"SkipTalkingPhaseEnabled":true,"MapPickOption":1,"Maps":[]},"VoiceChat":false,"VoiceChatName":".9727_0.","VoiceChatChannel":"channel_9727"}' >> $LOGPATH

sleep 2

echo '2024.04.07 19:47:38: Received SpawnPlayer packet:{"Type":202,"Slot":0,"Color":5,"Username":"Dillard","Female":false,"IsLocal":true,"Skin":"skin_metalhead"}' >> $LOGPATH
echo '2024.04.07 19:47:38: Received SpawnPlayer packet:{"Type":202,"Slot":1,"Color":0,"Username":"Joe","Female":false,"IsLocal":false,"Skin":"skin_doctor"}' >> $LOGPATH
echo '2024.04.07 19:47:38: Received SpawnPlayer packet:{"Type":202,"Slot":2,"Color":1,"Username":"Emily","Female":true,"IsLocal":false,"Skin":"skin_boney"}' >> $LOGPATH
echo '2024.04.07 19:47:38: Received SpawnPlayer packet:{"Type":202,"Slot":3,"Color":3,"Username":"Bogdan","Female":false,"IsLocal":false,"Skin":"skin_default"}' >> $LOGPATH
echo '2024.04.07 19:47:38: Received SpawnPlayer packet:{"Type":202,"Slot":4,"Color":4,"Username":"Rick","Female":false,"IsLocal":false,"Skin":"skin_tvguy"}' >> $LOGPATH

sleep 2

echo '2024.04.07 19:47:42: Received GameStart packet:{"Type":201,"Disconnected":[],"AFK":[]}' >> $LOGPATH
echo '' >> $LOGPATH