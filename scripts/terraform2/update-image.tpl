#!/usr/bin/env bash

TAG=1.0.$${GO_PIPELINE_LABEL}

echo "Logging into AWS ECR"
aws ecr get-login | bash

echo "Building image ${REPOSITORY_NAME}"
docker build -t ${REPOSITORY_NAME} .

echo "Tagging ${REPOSITORY_NAME} for ${REPOSITORY_URL}"
docker tag ${REPOSITORY_NAME}:latest \
    ${REPOSITORY_URL}:$${TAG}

echo "Pushing image to ECR"
docker push ${REPOSITORY_URL}:$${TAG}