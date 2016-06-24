'use strict'
var child = require('child_process');

function launchInstance(appName, profile, instanceProfileName, securityGroup) {
    var count = 2;

    var filename = "file://../boot" + appName + ".sh";
    return function() {
        var command = 'aws ec2 run-instances --profile ' + profile + ' --iam-instance-profile Name=' + instanceProfileName + ' --image-id ami-be14d3de --user-data ' +
            filename + '  --count ' + count + ' --instance-type t2.small --security-group-ids ' + securityGroup +  ' --key-name eng2-ssh --associate-public-ip-address';

        child.execSync(command);
    }
}

module.exports = launchInstance;