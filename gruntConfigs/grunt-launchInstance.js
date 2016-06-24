'use strict'
var child = require('child_process');

function launchInstance(appName, profile, instanceProfileName, securityGroup, subnetName) {
    var count = 2;

    var filename = "file://../socalcodecampdemo/boot" + appName + ".sh";
    return function() {
        var command = 'aws ec2 run-instances --profile ' + profile + ' --iam-instance-profile Name=' + instanceProfileName + ' --image-id ami-e80e1082 --user-data ' +
            filename + '  --count ' + count + ' --instance-type t2.small --security-group-ids ' + securityGroup + ' --subnet-id ' + subnetName + ' --key-name eng2-ssh --associate-public-ip-address';

        child.execSync(command);
    }
}

module.exports = launchInstance;