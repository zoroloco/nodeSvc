var util     = require("util"),
    Svc      = require("../svc.js"),
	pathUtil = require('path'),
	schedule = require('node-schedule'),
	mysql    = require("mysql"),
	utils    = require(pathUtil.join(__dirname,'../../commonUtils.js'));

process.title = "powerballSvc";

function PowerballSvc(){
	var self = this;
	PowerballSvc.super_.call(this);//call Svc constructor
	
	var db_host     = '';		
	var db_username = '';
	var db_password = '';
	
	process.argv.forEach(function (val, index, array){
		if(val == '-dbHost' && array.length>=index+1){	 
			db_host = process.argv[index+1];	
		}		
		if(val == '-dbUsername' && array.length>=index+1){	 
			db_username = process.argv[index+1];	
		}		
		if(val == '-dbPassword' && array.length>=index+1){	 
			db_password = process.argv[index+1];	
		}		
	});				
	
	if(utils.isEmpty(db_host) || utils.isEmpty(db_password) || utils.isEmpty(db_username)){
		this._log.error("The parameters: -dbHost,-dbUsername,-dbPassword are required.");
		process.exit(1);
	}	
	
	this._log.info("Connection info set for database host:"+db_host);
	
	this._con = mysql.createConnection({
		host: db_host,
		user: db_username,
		password: db_password
	});	
	
	con.connect(function(err){
		if(err){
			this._log.error("Error connecting to database:"+db_host);
			process.exit(1);
		}
		this._log.info("Successfully connected to database:"+db_host);
	});
	
	con.end(function(err) {
	  // The connection is terminated gracefully
	  // Ensures all previously enqueued queries are still
	  // before sending a COM_QUIT packet to the MySQL server.
	});
	
	
	
	
	//define functions
	
	ShellSvc.prototype.init = function(){
		self._log.info("Attempting to update database with latest powerball winnings.");
		
		//runs every morning at 2:10am.
		var j = schedule.scheduleJob('10 2 * * *',self.updateWinnings);
	}
	
	ShellSvc.prototype.updateWinnings = function(){
		self._log.info("Syncing database to latest powerball winnings.");
		
		
	}
}

util.inherits(PowerballSvc,Svc);

var powerballService = new PowerballSvc();
//powerballService.init();
powerballService.updateWinnings();