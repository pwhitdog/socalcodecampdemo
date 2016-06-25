#!/bin/bash
LB=$1
BUCKETNAME=$2
APPNAME=$3

echo 'LB: ' $LB
echo 'Bucket Name: ' $BUCKETNAME
echo 'Appname: ' $APPNAME

INSTANCE=`wget -q -O - http://169.254.169.254/latest/meta-data/instance-id`
echo "instance name = " $INSTANCE  >> /home/ec2-user/instance.log
sudo su -c "aws ec2 create-tags --resources $INSTANCE --tags Key=Name,Value=$APPNAME --region us-west-2 --profile demo" ec2-user

echo "registering with elastic load balancer" >> /home/ec2-user/instance.log
sudo su -c "aws elb register-instances-with-load-balancer --load-balancer-name $LB --instances $INSTANCE --region us-west-2 --profile demo" ec2-user
echo "load balanced" >> /home/ec2-user/instance.log

cd /home/ec2-user
echo "starting getLatestDeploy"  >> /home/ec2-user/instance.log
sudo su -c "~/.nvm/versions/node/v6.2.2/bin/node /home/ec2-user/getLatestDeploy.js $APPNAME $BUCKETNAME" ec2-user
VERSION=`ls *.zip`
sudo su -c "aws ec2 create-tags --resources $INSTANCE --tags Key=Version,Value=$VERSION --region us-west-2 --profile demo" ec2-user
cd /home/ec2-user/$APPNAME
echo "starting app" >> /home/ec2-user/instance.log
echo ${LB} ${INSTANCE} ${VERSION} >> /home/ec2-user/instance.log

sudo su -c '~/.nvm/versions/node/v6.2.2/bin/forever start bin/www &' ec2-user
sudo su -c "~/.nvm/versions/node/v6.2.2/bin/node /home/ec2-user/healthOfInstanceChecker.js ${LB} ${INSTANCE} ${VERSION}" ec2-user
sudo su -c "echo '*/1 * * * * ~/.nvm/versions/node/v6.2.2/bin/node /home/ec2-user/deathCron.js ${LB}' > /home/ec2-user/cronJob" ec2-user
sudo su -c "echo 'crontab -l | { cat; cat /home/ec2-user/cronJob; } | crontab -' | at now +10 minutes" ec2-user