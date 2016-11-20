var AWS = require('aws-sdk');
var fs = require('fs');
var yauzl = require('yauzl');
var mkdirp = require('mkdirp');
var path = require('path');

var s3 = new AWS.S3();

var prefix = process.argv[0];
var bucket = process.argv[1];

var getLatestPackageKey = function (data) {
    return data.Contents
        .map(function (item) {
            return item.Key;
        })
        .sort()
        .reverse()[0];
};

var unzip = function (fileName) {
    yauzl.open(fileName, {lazyEntries: true}, function (err, zipFile) {
        if (err) {
            throw err;
        }

        zipFile.readEntry();
        zipFile.on("entry", function (entry) {
            console.log(entry.fileName);
            if (/\/$/.test(entry.fileName)) {
                mkdirp(entry.fileName, function (err) {
                    if (err) {
                        throw err;
                    }

                    zipFile.readEntry();
                });
            } else {
                zipFile.openReadStream(entry, function (err, readStream) {
                    if (err) {
                        throw err;
                    }
                    mkdirp(path.dirname(entry.fileName), function (err) {
                        if (err) throw err;
                        readStream.pipe(fs.createWriteStream(entry.fileName));
                        readStream.on("end", function () {
                            zipFile.readEntry();
                        });
                    });
                });
            }
        });
    });
};

var savePackage = function (packageKey) {
    var params = {
        Bucket: bucket,
        Key: packageKey
    };

    s3.getObject(params, function (err, data) {
        if (err) {
            console.log(err, err.stack);
        }
        else {
            var fileName = packageKey.replace(prefix + '/', '');
            fs.writeFileSync(fileName, data.Body);
            unzip(fileName);
        }
    });
};

var bucketParams = {
    Bucket: bucket,
    Prefix: prefix
};

s3.listObjectsV2(bucketParams, function (err, data) {
    if (err) {
        console.log(err, err.stack);
    }
    else {
        var packageKey = getLatestPackageKey(data);
        savePackage(packageKey);
    }
});