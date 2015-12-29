"use strict";

var pathUtil     = require('path'),    
    fs           = require('fs'),
    async        = require('async'),
	childprocess = require('child_process'),
	utils        = require(pathUtil.join(__dirname,'./commonUtils.js')),
	logger       = require(pathUtil.join(__dirname,'./logger.js'));

process.title   = "svcMgr";
	
/**
 * 
 * 
 */
process.on('SIGTERM', function() {
	console.log(process.title+": Got kill signal. Exiting.");
	process.exit();
});

/*
 * Constructor
*/

function NodeSvc(config){
	var that  = this;
	this.log  = logger.initLogger(process.title);
	this.conf = null;
	
	if(this instanceof NodeSvc === false){
		throw new TypeError("Classes can't be function-called.");
	}			
	
	this.conf = config;

	try{
		if(!utils.isEmpty(this.conf)){
			this.log.info(process.title+": Successfully read well-formatted config file:\n"+JSON.stringify(this.conf));
			
			if(!utils.isEmpty(this.conf.log) && this.conf.log == 'true'){
				var logDir = pathUtil.join(__dirname,"../"+process.title+"_logs");//default
				this.log.info(process.title+": Turning on file logging.");				
				if(!utils.isEmpty(this.conf.logDir)){//optional field
					logDir = this.conf.logDir;
				}
				
				this.log = logger.initLogger(process.title,logDir);
				this.log.info(process.title+": File logging enabled. Log files will be kept in:"+logDir);
			}			
		}
		else{
			this.log.warn(process.title+": No config file defined.");
			this.log.info(process.title+": Creating default config file with file logging off.");
			this.conf = {"log" : "false"};
		}				
	}
	catch(e){
		this.log.warn(process.title+": Reading the config file resulted in the exception:"+e);				
	}	

	//Member definitions//
	
	NodeSvc.prototype.log_info = function log_info(msg){
		this.log.info(process.title+":"+msg);
	}
	
	NodeSvc.prototype.log_warn = function log_warn(msg){
		this.log.warn(process.title+":"+msg);
	}
	
	NodeSvc.prototype.log_error = function log_error(msg){
		this.log.error(process.title+":"+msg);
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
			that.log_info("Just forked child:"+svcName+" with parameters:\n"+paramArray);
			
			if(!utils.isEmpty(nodeChildProcess)){											
				//nodeChildProcess.send(data);			
				
				nodeChildProcess.on('message', function(nodeServiceOutput){
					that.log_info(service.name+" sent up message:"+nodeServiceOutput);
				});						

				nodeChildProcess.on('error', function(err){
					that.log_error(svcName+" child process error "+err);
				});

				nodeChildProcess.on('close', function(code,signal){
					if(!utils.isEmpty(code)){
						if(code == 0){
							that.log_info(svcName+" child process exited normally with code: "+code);	
						}
						else{
							that.log_error(svcName+" child process exited with code: "+code);
						}					
					}
					else if(!utils.isEmpty(signal)){
						that.log_error(svcName+" child process terminated by signal "+signal);
					}
					else{
						that.log_warn(svcName+" child process exited.");
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
					that.log_error(msg);
				});
			}
			
		}//enabled service
		else{
			that.log_info("Not starting "+svcName+" because it is disabled.");
		}

		function retryService(){
			if(service.keepAlive == true){
				var secondsElapsed = 10;
				that.log_info("Retrying "+svcName+" in "+secondsElapsed+" seconds.");
				
				setInterval(function(){					
					secondsElapsed--;
					//that.log_info("Retrying "+service.name+" in "+secondsElapsed+" seconds.");
					
					if(secondsElapsed <= 0){
						clearInterval(this);
						startService(service);
					}
				},1000);				
			}		
		}			
	}
	   	 
	NodeSvc.prototype.startServices = function startServices(){
		that.log_info("Attempting to start service(s)");
		if(!utils.isEmpty(this.conf)){
			if(!utils.isEmpty(this.conf.services) && this.conf.services.length>0){
				//loop through the services defined in config and auto start them.
				async.forEach(this.conf.services, this.startService, function(err){
					if(err)
						that.log_error("Error auto starting services with error: "+err);
					else{
						that.log_info("Finished auto starting service(s) - "+JSON.stringify(this.conf.services));
					}
				});	
			}
			else{
				that.log_info("No services defined. Nothing to do.");
			}
		}				
		
	}//startServices			
}//end constructor

module.exports = NodeSvc;