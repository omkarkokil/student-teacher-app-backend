#!/bin/bash
set -e  # Exit on first error

cd /home/ec2-user/myapp || exit 1

# Optional: log start
echo "Installing dependencies at $(date)" >> /home/ec2-user/install.log

# Ensure proper permissions
sudo chown -R ec2-user:ec2-user /home/ec2-user/myapp

# Use ec2-user’s environment to install (especially if nvm used)
sudo runuser -l ec2-user -c "cd /home/ec2-user/myapp && npm install" >> /home/ec2-user/install.log 2>&1
