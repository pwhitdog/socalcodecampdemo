var AWS = require('aws-sdk');

var loadBalancerName = process.argv[2];
var instanceId = process.argv[3];
var appVersion = process.argv[4];

var clientConfig = {region: 'us-west-2'};

if (!loadBalancerName) {
    console.error('Load Balancer Name must not be undefined');
    process.exit(1);
}

if (!instanceId) {
    console.error('Instance ID must not be undefined');
    process.exit(1);
}

if (!appVersion) {
    console.error('App Version must not be undefined');
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

var getIdsToRemove = function (others) {
    return new Promise(function (fulfill, reject) {
        if (0 === others.length) {
            fulfill(others);
        }

        var params = {
            InstanceIds: others
        };

        var ec2 = new AWS.EC2(clientConfig);
        ec2.describeInstances(params, function (err, data) {
            if (err) {
                reject(err);
            }
            else {
                var idsToRemove = data.Reservations
                    .reduce(function (a, b) {
                        return a.concat(b.Instances);
                    }, [])
                    .map(function (item) {
                        var version = item.Tags
                            .filter(function (tag) {
                                return tag.Key === 'Version' && tag.Value !== appVersion;
                            });
                        return {id: item.InstanceId, versionMatch: 0 === version.length};
                    })
                    .filter(function (i) {
                        return !i.versionMatch;
                    })
                    .map(function (i) {
                        return i.id;
                    });
                fulfill(idsToRemove);
            }
        });
    });
};

var purgeOtherVersions = function (ids) {
    return new Promise(function (fulfill, reject) {
        if (ids.length === 0) {
            fulfill(ids);
        }

        var params = {
            Instances: ids.map(function (id) {
                return {InstanceId: id};
            }),
            LoadBalancerName: loadBalancerName
        };

        var elb = new AWS.ELB(clientConfig);
        elb.deregisterInstancesFromLoadBalancer(params, function (err, data) {
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
        setTimeout(tryCleanupOlderVersions, 10 * 1000);
    } else {
        console.log(instanceId, 'is healthy @ version', appVersion);
        getIdsToRemove(others)
            .then(purgeOtherVersions)
            .then(function () {
                console.log("Done cleaning up older app versions...");
            });
    }
};

var tryCleanupOlderVersions = function () {
    console.log('Trying to clean up older app versions...');

    getHealthyInstances().then(checkInstanceHealth);
};

tryCleanupOlderVersions();

