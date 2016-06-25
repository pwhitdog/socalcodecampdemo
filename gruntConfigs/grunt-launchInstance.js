'use strict'
var child = require('child_process');

function launchInstance(appName, profile, instanceProfileName, securityGroup) {
    var count = 2;

    var filename = "file://../boot" + appName + ".sh";
    return function() {
        var command = 'aws ec2 run-instances --profile ' + profile + ' --image-id ami-5e54933e --user-data ' +

            filename + '  --count ' + count + ' --instance-type t2.small --security-group-ids ' + securityGroup +  ' --key-name aws-key --associate-public-ip-address';

        child.execSync(command);
    }
}

module.exports = launchInstance;