var util     = require("util"),
    Svc      = require("../svc.js"),
	pathUtil = require('path'),
	five     = require("johnny-five"),
	utils    = require(pathUtil.join(__dirname,'../../commonUtils.js'));

process.title = "arduinoSvc";

function ArduinoSvc(){
	var self = this;
	ArduinoSvc.super_.call(this);//call Svc constructor

	
	ArduinoSvc.prototype.init = function(){
		self._log.info("Initializing Arduino service.");
				
		board.on("ready", function(){
			var led = new five.Led(13);
			led.blink(500);
		});
	}
}

util.inherits(ArduinoSvc,Svc);

var arduinoService = new ArduinoSvc();
arduinoService.init();