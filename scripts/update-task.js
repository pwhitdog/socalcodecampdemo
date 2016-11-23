var AWS = require('aws-sdk');

function updateTask() {
    var projectName = process.env['REPOSITORY_NAME'];
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
        family: projectName,
        taskRoleArn: 'demos-ci'
    };
    
    var ecs = new AWS.ECS();
    ecs.registerTaskDefinition(params, function (err, data) {
        if (err) {
            console.log(err, err.stack);
        }
        else {
            console.log(data);
        }
    });
}

updateTask();