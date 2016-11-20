var AWS = require('aws-sdk');

// Create an S3 client
var s3 = new AWS.S3();

// Create a bucket and upload something into it
var params = {
    Bucket: 'demos-jcounts',
};

s3.listObjectsV2(params, function (err, data) {
    if (err) {
        console.log(err, err.stack);
    }
    else {
        console.log(data);
    }
});