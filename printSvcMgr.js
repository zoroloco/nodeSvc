var utils    = require('./commonUtils.js');
var fs       = require('fs');
var pathutil = require('path');
var async    = require('async');
var debug    = false;

process.title   = "printSvcMgr";
process.version = "1.0";	

/*
 *
 *
 */
start = function(conf){		   	 
	var log;

    /*
	 *
	 *
	 *
	*/
	function forkPrintServices(config){
		var paramArray = new Array();
		
		var params = nodeServiceParams.split(" ");
		if(!utils.isEmpty(params) && params.length>0){
			for(var i=0; i<params.length; i++){	
				var param = params[i];
				log.info("Setting parameter:"+p+" for node service:"+nodeService);
				paramArray.push(param);
			}
		}
	
		var nodeChildProcess = childprocess.fork(p,paramArray,{timeout: 25000,env: process.env});
		log.info(process.title+": Just forked child:"+p+" with parameters:"+paramArray);
		
		if(!utils.isEmpty(nodeChildProcess)){					
			
			if(!utils.isEmpty(outgoingEvent)){
				nodeChildProcess.send(outgoingEvent);
			}
			
			nodeChildProcess.on('message', function(nodeServiceOutput){
				
			});						

			nodeChildProcess.on('error', function(err){
				log.error(process.title+":"+p+" child process error "+err);
			});

			nodeChildProcess.on('close', function(code,signal){
				if(!utils.isEmpty(code)){
					log.warn(process.title+":"+p+" child process exited with code "+code);
				}
				else if(!utils.isEmpty(signal)){
					log.error(process.title+":"+p+" child process terminated by signal "+signal);
				}
				else{
					log.warn(process.title+":"+p+" child process exited");
				}								
			});
			
			nodeChildProcess.on('uncaughtException', function (err) {
				var msg="Uncaught Exception with node process:"+p+" ";
				if( err.name === 'AssertionError' ) {
					msg += err.message;
				} else {
					msg += err;
				}
				log.error(msg);
			});
		}	
	}//forkPrintSvc

	/*
	 *
	 *
	*/
	function startServices(){
		if(!utils.isEmpty(config) && !utils.isEmpty(config.monitors) && config.monitors.length>0){												
			//loop through the services defined in config and auto start them.
			async.forEach(config.services, startService, function(err){
				if(err)
					log.error(process.title+": Error auto starting service(s) - "+err);
				else{
					log.info(process.title+": Finished auto starting service(s) - "+JSON.stringify(autostart));
				}
			});	
		}				
	}//startServices
	
	/*
	 *
	 *
	*/
	function printArgs(){
		console.log("Sample run arguments:\n");
		console.log("node printSvcMgr -config /path/to/my/config/conf.json")
	}//printArgs

	/*
	 *
	 *
	*/
	function init(){
		log = utils.initLogger(process.title,conf.logDir);
		
		process.argv.forEach(function (val, index, array){
		
		if(val == '-version'){	 
			log.info("Version:"+process.version);	
		}
		
		forkPrintServices(config);
	}//init
	
	init();
}(require('./conf.json'));