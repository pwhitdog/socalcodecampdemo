#!/usr/bin/env bash

TAG=1.0.$${GO_PIPELINE_LABEL}
URL=${REPOSITORY_URL}
URI=$${URL:8}

echo "Logging into AWS ECR"
aws ecr get-login | bash

echo "Building image ${REPOSITORY_NAME}"
docker build -t ${REPOSITORY_NAME} .

echo "Tagging ${REPOSITORY_NAME} for $${URI}"
docker tag ${REPOSITORY_NAME}:latest \
    $${URI}:$${TAG}

echo "Pushing image to ECR"
docker push $${URI}:$${TAG}