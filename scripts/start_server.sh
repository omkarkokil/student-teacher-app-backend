#!/bin/bash
cd /home/ec2-user/myapp
nohup node app.js > server.log 2>&1 &
