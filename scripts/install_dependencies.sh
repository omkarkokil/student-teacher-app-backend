#!/bin/bash
set -e  # Exit on first error

cd /home/ec2-user/myapp || exit 1

# Optional: log start
echo "Installing dependencies at $(date)" >> /home/ec2-user/install.log


echo "✅ Fetching environment variables from SSM..."

DB_HOST=$(aws ssm get-parameter --name "/myapp/DB_HOST" --query "Parameter.Value" --output text)
DB_PORT=$(aws ssm get-parameter --name "/myapp/DB_PORT" --query "Parameter.Value" --output text)
DB_NAME=$(aws ssm get-parameter --name "/myapp/DB_NAME"  --query "Parameter.Value" --output text)
DB_USER=$(aws ssm get-parameter --name "/myapp/DB_USER"  --query "Parameter.Value" --output text)
BUCKET_NAME=$(aws ssm get-parameter --name "/myapp/BUCKET_NAME"  --query "Parameter.Value" --output text)
DB_PASSWORD=$(aws ssm get-parameter --name "/myapp/DB_PASSWORD"  --query "Parameter.Value" --output text)
JWT_SECRET=$(aws ssm get-parameter --name "/myapp/JWT_SECRET" --query "Parameter.Value" --output text)
SQS_QUEUE_URL=$(aws ssm get-parameter --name "/myapp/SQS_QUEUE_URL" --with-decryption --query "Parameter.Value" --output text)
AWS_ACCESS_KEY_ID=$(aws ssm get-parameter --name "/myapp/AWS_ACCESS_KEY_ID" --with-decryption --query "Parameter.Value" --output text)
AWS_SECRET_ACCESS_KEY=$(aws ssm get-parameter --name "/myapp/AWS_SECRET_ACCESS_KEY" --with-decryption --query "Parameter.Value" --output text)

sudo runuser -l ec2-user -c "
cd /home/ec2-user/myapp
cat > .env <<EOF
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
JWT_SECRET=$JWT_SECRET
SQS_QUEUE_URL=$SQS_QUEUE_URL
BUCKET_NAME=$BUCKET_NAME
AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
EOF
"


# Ensure proper permissions
sudo chown -R ec2-user:ec2-user /home/ec2-user/myapp

# Use ec2-user’s environment to install (especially if nvm used)
sudo runuser -l ec2-user -c "cd /home/ec2-user/myapp && npm install" >> /home/ec2-user/install.log 2>&1
