#!/bin/bash
LB=$1
BUCKET_NAME=$2
APP_NAME=$3

echo 'LB: ' ${LB}
echo 'Bucket Name: ' ${BUCKET_NAME}
echo 'App Name: ' ${APP_NAME}

INSTANCE=`wget -q -O - http://169.254.169.254/latest/meta-data/instance-id`

echo "Tagging ${INSTANCE} with App Name"
sudo su -c "aws ec2 create-tags --resources $INSTANCE --tags Key=Name,Value=$APP_NAME --region us-west-2" ec2-user

echo "Registering with ${LB}"
sudo su -c "aws elb register-instances-with-load-balancer --load-balancer-name $LB --instances $INSTANCE --region us-west-2" ec2-user
echo "Registering with ${LB}--done"

cd /home/ec2-user
echo "Getting latest version of ${APP_NAME} from ${BUCKET_NAME}"
sudo su -c "npm install aws-sdk yauzl mkdirp" ec2-user
sudo su -c "node /home/ec2-user/get-latest-deploy.js $APP_NAME $BUCKET_NAME" ec2-user

echo "Tagging $INSTANCE with version"
VERSION=`ls *.zip`
sudo su -c "aws ec2 create-tags --resources $INSTANCE --tags Key=Version,Value=$VERSION --region us-west-2" ec2-user
sudo su -c "rm *.zip" ec2-user

cd /home/ec2-user/${APP_NAME}
echo "Starting $APP_NAME..."
sudo su -c 'forever start bin/www &' ec2-user

echo "Waiting for app to become healthy before removing other versions."
sudo su -c "node /home/ec2-user/instance-health-checker.js ${LB} ${INSTANCE} ${VERSION}" ec2-user

sudo su -c "echo '*/1 * * * * node /home/ec2-user/death-cron.js ${LB} ${INSTANCE}' > /home/ec2-user/cronJob" ec2-user
sudo su -c "echo 'crontab -l | { cat; cat /home/ec2-user/cronJob; } | crontab -' | at now +10 minutes" ec2-user
sudo su -c "rm /home/ec2-user/cronJob" ec2-user