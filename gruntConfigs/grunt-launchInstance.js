'use strict';
var child = require('child_process');

module.exports = function (params) {
    var count = 2;
    var sshKeyName = 'demos-ci';
    var filename = "file://../boot" + params.appName + ".sh";
    var command = 'aws ec2 run-instances --image-id ' + params.ami +
        ' --user-data ' + filename +
        ' --count ' + count +
        ' --instance-type t1.micro ' +
        ' --security-group-ids ' + params.securityGroup +
        ' --key-name ' + sshKeyName +
        ' --associate-public-ip-address';

    return function () {
        child.execSync(command);
    }
};

