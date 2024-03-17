# Mind-Knight


Mind Knight is a companion app to [Mindnight](mindnightgame.com)

It automatically tracks props, votes, passes, vote timing and more in a friendly/scalable UI. It can even connect via any device on the same network through its browser (a phone friendly layout is on the way).

It's in early development and a few key features are still lacking.

This is a passion project of mine since I love Mindnight so much. I am in no way affiliated to the developers.

*If people like this, I will port it to Mac/Linux(inferior peasantry) and also continue developing a bunch more planned features*

Feel free to discuss/report bugs or request features here:
https://discord.gg/wDjxM2u

# Download
https://github.com/Nik-Novak/Mind-Knight/archive/master.zip

# How to get started
* Download this folder and place it wherever you like
* Extract the contents from the .zip
* Run the RUN.bat (or RUN) file in the main/root directory. A console window should show up with a welcoming message if done correctly, and a window should open in your browser
* Now you have a choice, view the app on the same PC or on a different device.
  * Same: open a browser and visit localhost:8080
  * Different: Open a browser on any machine on your network and scan the QR code (has to be on the same wifi)
* You may go to localhost:8080, or your local IP 192.168.*.* on as many browsers/devices as you want

# Updating?
Just download the latest version from above, then delete your old files and replace them!
Or try updating on the main menu.

# Help with the interface

![MindKnight-guide](https://github.com/Nik-Novak/Mind-Knight/assets/26068682/14f1ee47-2bb5-4ef4-af05-c4ea2879b647)

![MK help](https://image.ibb.co/idENnq/help.png)

# Limitations
* Currently only works on windows, it's pretty easy to port to Unix so if enough people want it I will. Check discord.
* The project may have bugs/kinks to iron out since it has just been released and its more of a passion project than a professional release

# Changelog
* v0.5.0-1
  * Some games not uploading (temp hotfix)
* v0.5.0-0
  * Elo System!
* v0.4.*
  * I forgot to write changelog notes, oh well
* v0.3.0-0
  * Added node identifiers in chat to more easily figure out when a message was sent
  * Added chat search functionality, to search for previous messages
  * Added chat search filtering, which toggles the visibility of chat messages that don't match search query
  * Fixed global font, allowing everyone to see the Mindnight Munro font
* v0.2.1-10
  * Fixed a bug where number of games logged per user was capped
* v0.2.1-9
  * November compatibility fix
* v0.2.1-7
  * Major hotfixes
* v0.2.1
  * Added separate screen for the update process
  * Added user experience improvements to update process
* v0.2.0
  * Automatic updater, downloads and replaces updated files
* v0.1.1-1
  * Hotfix for game tracking
* v0.1.1
  * Added version number to main screen
  * Added update link to main screen if version is out of date
  * Added game tracking
* v0.1.0
  * Chat replay added, select someone's prop and it will scroll to show you the chat at the time of the prop/pass/vote
  * Fixed advanced prop info not showing up for certain players when they hadn't made a prop that turn
  * Fixed advanced prop info not updating when already hovering over a player
* v0.0.7
  * Added 8 man support
  * Added more proposal information when hovering over a player after selecting a prop to view (vote timing, proposal timing, etc)
* v0.0.5
  * Fixed bug with previous node hack/secure results carrying over to the next game
  * Added version control to remind you when there is a new update for MindKnight files
  * Tested and works with up to 7 man mainframe
* v0.0.3 
  * Fixed reference to node binaries for those that do not have Node installed.
  * Reverted localhost:8080 from being a host option. Now only works on local IP that is printed in console. 
* v0.0.2 Release!

Have fun!

https://www.virustotal.com/gui/file/c005449e0e80790b3a1fc6493df64a68186ffb31d5e54ed240b90538553aa873/detection
