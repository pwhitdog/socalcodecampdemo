﻿var process = require('process');
var gruntDeploy = require('./gruntConfigs/grunt-deploy');
var npmInstall = require('./gruntConfigs/npm-install');
var zip = require('./gruntConfigs/grunt-zip');
var s3Upload = require('./gruntConfigs/grunt-s3Upload');
var createBootScript = require('./gruntConfigs/grunt-createBootScript');
var launchInstance = require('./gruntConfigs/grunt-launchInstance');

module.exports = function(grunt) {
    var bucketName = grunt.option('bucketName');
    var profileName = grunt.option('profileName');
    var securityGroup = grunt.option('securityGroup');
    var subnetName = grunt.option('subnetName');

    /* Load grunt task adapters */

    grunt.event.on('coverage', function(lcovFileContents, done) {
        done();
    });

    /* Register composite grunt tasks */

    grunt.registerTask('gruntDeploy', gruntDeploy('socalcodecampdemo'));
    grunt.registerTask('npmInstall', npmInstall('socalcodecampdemo'));
    grunt.registerTask('zipDeploy', zip('socalcodecampdemo'));
    grunt.registerTask('s3Upload', s3Upload('socalcodecampdemo', bucketName, profileName));
    grunt.registerTask('createBootScript', createBootScript('socalcodecampdemo', bucketName, 'lb-web-central'));
    grunt.registerTask('launchInstance', launchInstance('socalcodecampdemo', profileName, 'web-server', securityGroup, subnetName));


    grunt.registerTask('deploy', ['gruntDeploy','npmInstall', 'zipDeploy', 's3Upload', 'createBootScript', 'launchInstance']);

};