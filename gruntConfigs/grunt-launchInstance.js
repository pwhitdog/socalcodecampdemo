'use strict'
var child = require('child_process');

function launchInstance(profile, instanceProfileName, securityGroup, yourAMIGoesHERE, params) {
    var count = 2;

    var filename = "file://../boot" + params.appName + ".sh";
    return function() {
        var command = 'aws ec2 run-instances --image-id ' + params.ami + ' --user-data ' +

            filename + '  --count ' + count + ' --instance-type t2.small --security-group-ids ' + params.securityGroup +  ' --key-name aws-key --associate-public-ip-address';

        child.execSync(command);
    }
}

module.exports = launchInstance;