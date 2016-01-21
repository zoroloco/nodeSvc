var util     = require("util"),
    Svc      = require("../svc.js"),
	pathUtil = require('path'),
	utils    = require(pathUtil.join(__dirname,'../../commonUtils.js'));

process.title = "arduinoSvc";

function ArduinoSvc(){
	var self    = this;	
	
	ArduinoSvc.super_.call(this);//call Svc constructor
	
	ArduinoSvc.prototype.init = function(){
		self._log.info("Initializing Arduino service.");
						
	}
}

util.inherits(ArduinoSvc,Svc);

var arduinoService = new ArduinoSvc();
arduinoService.init();