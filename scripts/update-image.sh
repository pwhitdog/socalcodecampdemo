#!/usr/bin/env bash

echo "Logging into AWS ECR"
aws ecr get-login | bash

echo "Building image ${REPOSITORY_NAME}"
docker build -t ${REPOSITORY_NAME} .

echo "Tagging ${REPOSITORY_NAME} for ${REPOSITORY_URL}"
docker tag ${REPOSITORY_NAME}:latest \
    ${REPOSITORY_URL}/${REPOSITORY_NAME}:latest

echo "Pushing image to ECR"
docker push ${REPOSITORY_URL}/${REPOSITORY_NAME}:latest