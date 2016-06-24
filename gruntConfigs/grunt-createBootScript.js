'use strict'

var fs = require('fs');


function createBootScript(appName, bucketName, lbName) {

    return function() {
        var templatePath = 'gruntConfigs/bootGenericServerTemplate.sh';

        var fileContents = fs.readFileSync( templatePath, { encoding: "utf-8" });
        fileContents = fileContents.replace('$1', lbName).replace('$2', bucketName).replace('$3', appName);

        fs.writeFileSync('../boot' + appName + '.sh', fileContents);
        console.log('File created.');
    }
}

module.exports = createBootScript;