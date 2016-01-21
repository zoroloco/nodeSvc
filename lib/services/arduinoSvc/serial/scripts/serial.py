#!/usr/bin/python2

import sys
import thread
import getopt

from sys import stdin

device = '' # /dev/ttyACM0
baud   = '' #9600

try:
    opts, args = getopt.getopt(sys.argv[1:], 'd:b', ['device=','baud='])
except getopt.GetoptError:
    sys.stderr.write("Invalid commandline argument.")
    sys.exit(2)

for opt, arg in opts:
    if opt in ('--device','d'):
        device = arg
        print "Setting device as ",device
    if opt in ('--baud','b'):
        baud = arg
        print "Setting baud as ",baud

print "Opening serial port on device: ",device, "with baud rate of ",baud

arduino = serial.Serial(device,baud,timeout=30)

#start threads
try:
    serialInThread = serialIn(1, "SerialIn", arduino)
	
	serialInThread.start()
    
except:
    sys.stderr.write("Error. Unable to start threads.")
