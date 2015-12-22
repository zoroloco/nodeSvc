"use strict";

var pathUtil     = require('path'),    
    fs           = require('fs'),
    async        = require('async'),
	childprocess = require('child_process'),
	utils        = require(pathUtil.join(__dirname,'./commonUtils.js')),
	logger       = require(pathUtil.join(__dirname,'./logger.js'));

process.title   = "svcMgr";
var log         = logger.initLogger(process.title,false);
	
/**
 * 
 * 
 */
process.on('SIGTERM', function() {
	log.info(process.title+": Got kill signal. Exiting.");
	process.exit();
});

/*
 * Constructor
*/
function NodeSvc(conf){
	if(this instanceof NodeSvc === false){
		throw new TypeError("Classes can't be function-called.");
	}		
	
	if(!utils.isEmpty(conf)){
		log.info("Setting conf file:"+conf);
		this.conf = conf;			
	}		
	else{
		log.info("Using default conf settings.");
		this.conf = {"log" : "false"};
	}
	
	if(!utils.isEmpty(conf.log) && conf.log == 'true'){
		log = logger.initLogger(process.title,true);
	}		
}

NodeSvc.prototype.startService = function startService(service){
	var svcName = service.name+"-"+service.title;
	
	if(!service.disabled){
		var paramArray = new Array();
	
		for(var attributename in service){
			paramArray.push("-"+attributename);
			paramArray.push(service[attributename]);
		}
	
		var p = pathUtil.join(pathUtil.join(__dirname,"services"),service.name)+".js";
	
		var nodeChildProcess = childprocess.fork(p,paramArray,{timeout: 25000,env: process.env});
		log.info(process.title+": Just forked child:"+svcName+" with parameters:\n"+paramArray);
		
		if(!utils.isEmpty(nodeChildProcess)){											
			//nodeChildProcess.send(data);			
			
			nodeChildProcess.on('message', function(nodeServiceOutput){
				log.info(process.title+":"+service.name+" sent up message:"+nodeServiceOutput);
			});						

			nodeChildProcess.on('error', function(err){
				log.error(process.title+":"+svcName+" child process error "+err);
			});

			nodeChildProcess.on('close', function(code,signal){
				if(!utils.isEmpty(code)){
					if(code == 0){
						log.info(process.title+":"+svcName+" child process exited normally with code: "+code);	
					}
					else{
						log.error(process.title+":"+svcName+" child process exited with code: "+code);
					}					
				}
				else if(!utils.isEmpty(signal)){
					log.error(process.title+":"+svcName+" child process terminated by signal "+signal);
				}
				else{
					log.warn(process.title+":"+svcName+" child process exited.");
				}	

				retryService();									
			});
			
			nodeChildProcess.on('uncaughtException', function (err) {
				var msg="Uncaught Exception with node process:"+svcName+" ";
				if( err.name === 'AssertionError' ) {
					msg += err.message;
				} else {
					msg += err;
				}
				log.error(msg);
			});
		}
		
	}//enabled service
	else{
		log.info("Not starting "+svcName+" because it is disabled.");
	}

	function retryService(){
		if(service.keepAlive == true){
			var secondsElapsed = 10;
			log.info(process.title+":Retrying "+svcName+" in "+secondsElapsed+" seconds.");
			
			setInterval(function(){					
				secondsElapsed--;
				//log.info(process.title+":Retrying "+service.name+" in "+secondsElapsed+" seconds.");
				
				if(secondsElapsed <= 0){
					clearInterval(this);
					startService(service);
				}
			},1000);				
		}		
	}			
}
	   	 
NodeSvc.prototype.startServices = function startServices(){
	if(!utils.isEmpty(conf) && !utils.isEmpty(conf.services) && conf.services.length>0){												
		//loop through the services defined in config and auto start them.
		async.forEach(conf.services, startService, function(err){
			if(err)
				log.error(process.title+": Error auto starting services with error: "+err);
			else{
				log.info(process.title+": Finished auto starting service(s) - "+JSON.stringify(conf.services));
			}
		});	
	}				
}//startServices			

module.exports = NodeSvc;