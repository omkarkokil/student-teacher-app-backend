cd /home/ec2-user/app
pm2 stop all || true
pm2 start app.js --name "my-node-app"


