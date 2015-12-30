# nodeSvc

A platform independent and highly configurable node service that can spawn child processes.  
All child process parameters can be configured in conf.json.  

Install

npm install nodesvc


Test

npm test nodesvc


Sample configuration file

{"log" : "true",   //optional
 "logDir" : "C:\\nodelogfiles", //optional
 "services" : [  //optional
    {"name"        : "printSvc", 
	 "title"       : "test1", 
	 "log"         : true, //optional
	 "keepAlive"   : false, //optional
	 "printerName" : "testprinter1", 
	 "deleteFiles" : true, //optional
	 "disabled"    : true, //optional
	 "watchDir"    : "C:\\Users\\kcenturion\\Documents\\dev\\nodeSvc\\test"},
	 
	{"name"        : "shellSvc",
	 "title"       : "h264Streamer",
	 "cmd"         : "raspivid -t 999999 -fps 24 -w 320 -h 240 -b 800000 -o - | ffmpeg -f h264 -i - -codec:v libtheora -qscale:v 4 -an http://localhost:8160/feed.ffm",
	 "log"         : "false", //optional
	 "keepAlive"   : false, //optional
	 "disabled"    : true} //optional
	 
	] 
}

keepAlive - If the service fails for any reason, then the service manager will respawn it after 10 seconds.
