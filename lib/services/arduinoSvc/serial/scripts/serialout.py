#!/usr/bin/python2




def serialOut(threadName,device_port):
    print threadName, ": Opening serial out."
    while 1:
        cmd = stdin.readline()
        print "Sending command to serial ",cmd
        device_port.write(cmd)
    device_port.close()
