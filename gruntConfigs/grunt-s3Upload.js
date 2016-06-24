'use strict';

var child = require('child_process');
var fs = require('fs');
var moment = require('moment');

function s3upload(appName, bucketName, profileName) {
    return function() {
        var zipfile = '../deploy/' + appName + '.zip';
        var s3Name = moment.utc().format('YYYY-MM-DD-HH-mm-ss') + '.zip';
        child.execSync('aws s3 cp ' + zipfile + ' s3://' + bucketName +'/' + appName + '/' + s3Name + ' --profile ' + profileName);
        console.log(s3Name);
    }
}

module.exports = s3upload;