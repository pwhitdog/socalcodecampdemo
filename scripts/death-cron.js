var AWS = require('aws-sdk');

var loadBalancerName = process.argv[2];
var instanceId = process.argv[3];

var clientConfig = {region: 'us-west-2'};

if (!loadBalancerName) {
    console.error('Load Balancer Name must not be undefined');
    process.exit(1);
}

if (!instanceId) {
    console.error('Instance ID must not be undefined');
    process.exit(1);
}

var getHealthyInstances = function () {
    return new Promise(function (fulfill, reject) {
        var params = {
            LoadBalancerName: loadBalancerName
        };

        var elb = new AWS.ELB(clientConfig);
        elb.describeInstanceHealth(params, function (err, data) {
            if (err) {
                reject(err);
            }
            else {
                fulfill(data.InstanceStates
                    .filter(function (item) {
                        return item.State === 'InService';
                    })
                    .map(function (item) {
                        return item.InstanceId;
                    }));
            }
        });
    })
};

var selfDestruct = function () {
    return new Promise(function (fulfill, reject) {
        var params = {
            InstanceIds: [instanceId],
            DryRun: false
        };

        var ec2 = new AWS.EC2(clientConfig);
        ec2.terminateInstances(params, function (err, data) {
            if (err) {
                reject(err);
            }
            else {
                fulfill(data);
            }
        });
    });
};

var checkInstanceHealth = function (data) {
    var others = data.filter(function (item) {
        return item !== instanceId;
    });

    var healthyInstance = others.length < data.length;
    if (!healthyInstance) {
        console.log(instanceId, 'is not healthy');
        selfDestruct().then(function () {
            console.log('Self destruct initiated...');
        })
    }
};

console.log('Checking my health...');
getHealthyInstances().then(checkInstanceHealth);

