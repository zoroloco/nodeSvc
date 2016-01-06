var util     = require("util"),
    Svc      = require("../svc.js"),
	pathUtil = require('path'),
	utils    = require(pathUtil.join(__dirname,'../../commonUtils.js')),
    chokidar = require('chokidar'),
    fs       = require('fs');

process.title = "printSvc";

function PrintSvc(){
	var self = this;
	PrintSvc.super_.call(this);//call Svc constructor
	this._deleteFiles = false;
	this._watchDir    = '';
	this._printerName = '';
	
	process.argv.forEach(function (val, index, array){			
		
		if(val == '-watchDir' && array.length>=index+1){	 
			self._watchDir = process.argv[index+1];	
		}
		
		if(val == '-deleteFiles' && array.length>=index+1){	 
			self._deleteFiles = process.argv[index+1];	
		}
		
		if(val == '-printerName' && array.length>=index+1){	 
			self._printerName = process.argv[index+1];	
		}		
	});
			
	if(utils.isEmpty(this._printerName)){//need printer name
		this._log.error("Printer name is a required argument. Please run with -printerName");
		process.exit(1);
	}

	if(utils.isEmpty(this._watchDir)){//need watchDir
		this._log.error("Watch directory is a required argument. Please run with -watchDir");
		process.exit(1);			
	}
	
	PrintSvc.prototype.init = function(){	
		try{
			if(fs.statSync(self._watchDir).isDirectory()){
				self.createFolders();
				self.watchDirectory();	
			}	
			else{
				self._log.error("Watch directory:"+self._watchDir+" does not exist on the file system.");
				process.exit(1);
			}
		}
		catch(e){
			self._log.error(e);
			process.exit(1);
		}			
	}
	
	PrintSvc.prototype.deleteFile = function(filePath){
		fs.unlink(filePath,function(err){
			if(err){
				self._log.error("Error deleting file:"+filePath);
				throw err;
			}
			else{
				self._log.info("Successfully deleted file:"+filePath);
			}
		});
	}//deleteFile
		
	PrintSvc.prototype.getPrintCmd = function(filePath){
		if(process.platform == 'win32'){
			//return "gsprint -printer "+printerName+" "+filePath;
			self._log.error("Printing not supported on Windows.");
		}
		else{ //linux
			self._log.info("Printing file:"+filePath);
		}
		
		return null;
	}
	
	PrintSvc.prototype.processFileAdd = function(filePath){
		if(fs.statSync(filePath).isFile()){
			var printCmd = self.getPrintCmd(filePath);
			if(!utils.isEmpty(printCmd)){
				utils.executeCommand(printCmd,
				function(cmdResult,msg,stdout){
					self._log.info(msg);
					
					if(cmdResult){
						self._log.info(filePath+" printed successfully with standard output:"+stdout);
						if(self._deleteFiles){
							self._log.info("Attempting to delete printed file:"+filePath);
							self.deleteFile(filePath);
						}
						else{
							self._log.info("Attempting to move "+filePath+" to printed folder.");							
						}
					}
					else{
						self._log.error(filePath+" did not print.");
					}
				});									
			}										
		}			
		else{
			self._log.error(filePath+" does not exist. Cannot print.");
		}
	}//processFileAdd
	
	PrintSvc.prototype.createFolders = function(){
		try 
		{
			fs.mkdirSync(pathUtil.join(self._watchDir,"errors"));
			self._log.info("Successfully created errors folder.");
			fs.mkdirSync(pathUtil.join(self._watchDir,"printed"));
			self._log.info("Successfully created printed folder.");
		} 
		catch(e) {
			if ( e.code != 'EEXIST' ){ 
				throw e;
			}
		}						
	}
	
	PrintSvc.prototype.watchDirectory = function(){
		var watcher = chokidar.watch(self._watchDir, {
		  ignored: /[\/\\]\./, 
		  persistent: true,
		  ignoreInitial : true,
		  awaitWriteFinish: true
		});
		
		self._log.info("Now watching:"+self._watchDir+" for new files.");
		
		watcher.on('add', function(path) { 
			self._log.info("File "+path+" has been added.");								
			self.processFileAdd(path);
		})		  
	}//watchDir
}

util.inherits(PrintSvc,Svc);

var printService = new PrintSvc();
printService.init();
		

		

		
	