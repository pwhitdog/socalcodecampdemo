'use strict';

var child = require('child_process');
var fs = require('fs');
var moment = require('moment');

module.exports = function (appName, bucketName, profileName) {
    return function () {
        var source = '../deploy/' + appName + '.zip';
        var s3Name = moment.utc().format('YYYY-MM-DD-HH-mm-ss') + '.zip';
        child.execSync('aws s3 cp ' + source + ' s3://' + bucketName + '/' + appName + '/' + s3Name);
        console.log('Uploaded deployment package:', s3Name);
    }
};