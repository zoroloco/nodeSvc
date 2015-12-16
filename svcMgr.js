var utils        = require('./commonUtils.js'),
    fs           = require('fs'),
    pathUtil     = require('path'),
    async        = require('async'),
	childprocess = require('child_process'),
	logger       = require('./logger.js');

process.title   = "svcMgr";
process.version = "0.0";	
var log         = logger.initLogger(process.title,false);
	
/**
 * 
 * 
 */
process.on('SIGTERM', function() {
	log.info(process.title+": Got kill signal. Exiting.");
	process.exit();
});


start = function(conf){		   	 

	function startService(service){	
		var svcName = service.name+"-"+service.title;
	
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
	}//startService

	function startServices(){
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

	if(conf.log == 'true'){
		log = logger.initLogger(process.title,true);
	}	
	
	log.info("Starting "+process.title+" with pid "+process.pid);	
	
	process.argv.forEach(function (val, index, array){
		if(val == '-version'){	 
			log.info("Version:"+process.version);	
		}
	});
	startServices();			
}(require('./conf.json'));