#!/usr/bin/python2

import threading
import serial

class serialIn (threading.Thread):
    def __init__(self, threadID, name,arduino):
	    threading.Thread.__init__(self)
		self.threadID = threadID
		self.name     = name
		self.arduino  = arduino
	def run(self):
	    print "Starting "+ self.name
		receiveData(self.arduino)
		arduino.close()
		
def receiveData(arduino):
    lastInput = ''    
    while 1:
        input = arduino.readline()#read 1 byte at a time
        if(lastInput != input):#only stdout data if new
            sys.stdout.write(input)
            lastInput = input    
    