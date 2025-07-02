#!/bin/bash
set -e

APP_DIR="/home/ec2-user/myapp"
APP_FILE="app.js"

echo "Starting app at $(date)" >> $APP_DIR/start.log

# Check and install PM2 globally if not found base test commit for one
if ! command -v pm2 &> /dev/null; then
  echo "PM2 not found, installing..." >> $APP_DIR/start.log
  sudo npm install -g pm2
fi

# Start the app as ec2-user using PM2
sudo runuser -l ec2-user -c "cd $APP_DIR && pm2 start $APP_FILE --name myapp" >> $APP_DIR/start.log 2>&1

# Optional: set up PM2 to start on reboot
#sudo runuser -l ec2-user -c "pm2 startup --shell bash --yes"
# sudo runuser -l ec2-user -c "pm2 save"
