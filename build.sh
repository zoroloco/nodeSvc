#!/bin/bash
# Instruction: move this file to /usr/local/src and run from there.
#
# chmod +x build.sh
#
# This script will get latest site from github
#
clear

echo "Running build script."

SRC_DIR="/usr/local/src/printSvc"

echo "Deleting source directory"
rm -rf $SRC_DIR

echo "Creating source directory"
mkdir $SRC_DIR

echo "Retrieving latest repo: git clone https://github.com/zoroloco/nodeSvc.git " $SRC_DIR
git clone https://github.com/zoroloco/nodeSvc.git $SRC_DIR

echo "making launcher executable."
chmod 755 $SRC_DIR/launcher.sh

read -p "Restart now? " -n 1 -r
if [[ $REPLY =~ ^[Yy]$ ]]
then
    sudo shutdown -r now
else
    echo "bye!"
fi

echo "done! Good Phoebe!"
