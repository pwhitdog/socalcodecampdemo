'use strict';

var fs = require('fs');
var archiverLib = require('archiver');
var rimraf = require('rimraf');

var root = '../deploy/';

function archiver(appName) {
    var fileName = root + appName + '.zip';
    var dir = root + appName;

    return function() {
        var done = this.async();
        var output = fs.createWriteStream(fileName)
        var archive = archiverLib('zip');

        output.on('close', done);

        archive.pipe(output);
        archive.bulk([
            { expand: true, cwd: dir, src: ['**/*'], dest: '/' + appName }
        ]);
        archive.finalize();

    }
}

module.exports = archiver;