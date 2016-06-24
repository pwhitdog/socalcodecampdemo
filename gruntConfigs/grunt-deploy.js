﻿'use strict';

var fs = require('fs');
var rimraf = require('rimraf');
var child = require('child_process');
var ncp = require('ncp');
var path = require('path');

function deploy(appName) {
    return function () {

        var root = '../deploy/';
        if (!fs.existsSync(root)) {
            fs.mkdirSync(root);
        }

        var destDir = root + appName;

        var done = this.async();

        //-delete existing deploy folder
        rimraf(destDir, function () {
            rimraf(root + appName + '*.zip', function () {
                console.log('deleted destDir');

                fs.mkdirSync(destDir);

                console.log('mkdir on destDir');

                console.log('copying ./ to destDir');

                var fileExcludes = {
                    exclusions: ['node_modules', 'obj', 'frontendTests', 'test', 'typings', 'coverage-karma', '.vs',
                        '.vscode', '.ebextensions', 'coverage-mocha', '.git', '.gitignore', 'log.txt', 'update-common.bat']
                };
                var options = {
                    clobber: true,
                    filter: function (filePath) {
                        var dirName = path.parse(filePath);
                        var fileNameParts = filePath.split(path.sep);
                        var fileName = fileNameParts.pop();
                        var folderName = fileNameParts.pop();

                        function contains(name) {
                            return fileExcludes.exclusions.indexOf(name) !== -1;
                        }

                        return !contains(fileName) && !contains(folderName);
                    }
                };

                console.log('reading package.json');
                var packageContent = require('../' + appName + '/package.json');


                ncp('.', destDir, options, function (err) {
                    if (err) {
                        console.error(err);
                    }
                        done(true);
                });
            });
        });




    };
}

module.exports = deploy;