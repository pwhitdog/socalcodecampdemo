var AWS = require('aws-sdk');
var fs = require('fs');
var yauzl = require('yauzl');
var mkdirp = require('mkdirp');
var path = require('path');

// Create an S3 client
var s3 = new AWS.S3();

// Create a bucket and upload something into it
var bucket = 'demos-jcounts';
var prefix = 'socaldemo';
var bucketParams = {
    Bucket: bucket,
    Prefix: prefix
};

var getLatestPackageKey = function (data) {
    return data.Contents
        .map(function (item) {
            return item.Key;
        })
        .sort()
        .reverse()[0];
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

            yauzl.open(fileName, {lazyEntries: true}, function(err, zipFile) {
                if (err) {
                    throw err;
                }

                zipFile.readEntry();
                zipFile.on("entry", function(entry) {
                    if (/\/$/.test(entry.fileName)) {
                        mkdirp(entry.fileName, function(err) {
                            if (err) {
                                throw err;
                            }

                            zipFile.readEntry();
                        });
                    } else {
                        zipFile.openReadStream(entry, function(err, readStream) {
                            if (err) {
                                throw err;
                            }
                            mkdirp(path.dirname(entry.fileName), function(err) {
                                if (err) throw err;
                                readStream.pipe(fs.createWriteStream(entry.fileName));
                                readStream.on("end", function() {
                                    zipFile.readEntry();
                                });
                            });
                        });
                    }
                });
            });
        }
    });
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