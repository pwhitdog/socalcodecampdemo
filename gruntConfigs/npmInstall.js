'use strict';

var child = require('child_process');

function npmInstall(appName) {
    return function() {
        var root = '../deploy/';
        var destDir = root + appName;

        child.execSync('npm install --production', {cwd:destDir});

    }
};

module.exports = npmInstall;