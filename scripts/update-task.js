var AWS = require('aws-sdk');
var clientConfig = {region: process.env['AWS_DEFAULT_REGION']};

var projectName = process.env['REPOSITORY_NAME'];
function updateTask() {
    var tag = '1.0.' + process.env['GO_PIPELINE_LABEL'];
    var imageUri = process.env['REPOSITORY_URL'] + '/' + projectName + ':' + tag;

    var params = {
        containerDefinitions: [
            {
                image: imageUri,
                memoryReservation: 128,
                name: projectName,
                portMappings: [
                    {
                        containerPort: 3000,
                        hostPort: 0,
                        protocol: 'tcp'
                    }
                ]
            }
        ],
        family: projectName
    };

    var ecs = new AWS.ECS(clientConfig);


    return new Promise(function (fulfill, reject) {
        ecs.registerTaskDefinition(params, function (err, data) {
            if (err) {
                reject(err)
            }
            else {
                console.log(data);
                fulfill(data)
            }
        });
    })
}

function updateService(taskData) {
    var params = {
        service: projectName,
        cluster: projectName,
        taskDefinition: taskData.taskDefinition.taskDefinitionArn
    };

    var ecs = new AWS.ECS(clientConfig);

    return new Promise(function (fulfill, reject) {
        ecs.updateService(params, function (err, data) {
            if (err) {
                reject(err);
            }
            else {
                console.log(data);
                fulfill(data);
            }
        });
    })
}

updateTask()
    .then(updateService)
    .catch(function () {
        process.exit(1);
    });