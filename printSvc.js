var utils    = require('./commonUtils.js');
var net      = require('net');
var chokidar = require('chokidar');
var fs       = require('fs');
var pathutil = require('path');

process.version = "1.0";			

	/**
	 * 
	 * 
	 */
	process.on('SIGTERM', function() {
		log.warn(process.title+": Got kill signal. Exiting.");
		process.exit();
	});
	
	/**
	 * 
	 * 
	 */
	process.on('message', function(data) {
		if(!utils.isEmpty(data)){
			log.info(process.title+": Received data from parent process.");		
			var parsedData = JSON.parse(data);
		}
	});
	
	/*
	 *
	 *
	 */
	start = function(){		   	
		var debug       = false;
        var processName = '';
		
		function deleteFile(filePath){
			fs.unlink(filePath,function(err){
				if(err){
					log.error("Error deleting file:"+filePath);
					throw err;
				}
				else{
					log.info("Successfully deleted file:"+filePath);
				}
			});
		}//deleteFile
		
		/**
		*
		*
		*/
		function processFileAdd(filePath){
			fs.exists(filePath, function (exists) {
				if(exists){										
					//executeCommand("gsprint.exe -dBATCH -printer 'Dell C1760nw Color Printer' -ghostscript "+filePath,
					executeCommand("print "+filePath,
						function(result){
							if(result){
								log.info(filePath+" printed successfully.");
								deleteFile(filePath);
							}
							else{
								log.error(filePath+" did not print.");
							}
						});																																					
				}
				else{
					log.error(filePath+" does not exist. Cannot print.");
				}
			});			
		}//processFileAdd

		/**
		 *
		 *
		*/
		function watchDir(path){
			var watcher = chokidar.watch(watchDir, {
			  ignored: /[\/\\]\./, 
			  persistent: true,
			  ignoreInitial : true,
			  awaitWriteFinish: true
			});
			
			log.info("Now watching:"+watchDir+" for new files.");
			
			watcher
			  .on('add', function(path) { 
					log.info("File "+path+" has been added.");								
					processFileAdd(path);											
				})		  
		}//watchDir
		
		/**
		 *
		 *
		*/
		function init(){
			process.argv.forEach(function (val, index, array){
			if(array.length<2){
				log.error(process.title+":Invalid Parameters");
				process.exit(process.title+":Invalid Arguments");
			}
			
			if(val == '-debug'){
				debug = true;
			}
			
			if(val == '-watchDir' && array.length>=index+1){	 
				dir = process.argv[index+1];	
			}
			
			if(val == '-deleteFiles' && array.length>=index+1){	 
				deleteFiles = process.argv[index+1];	
			}
			
			if(val == '-processName' && array.length>=index+1){	 
				processName = process.argv[index+1];	
			}

			//validate arguments
			if(!utils.isEmpty(processName)){
			   process.title = processName;
			   log.info("Starting child process:"+process.title);
			}
			else{
				log.error("Process name is a required argument. Please run with -processName")
				process.exit();
			}
			
			if(!utils.isEmpty(dir)){
				watchDir(dir);	
			}
			else{
				log.error("Watch directory is a required argument. Please run with -watchDir");
				process.exit();
			}
		}//init
		
		init();
	}();