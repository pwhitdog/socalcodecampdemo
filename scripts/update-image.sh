#!/usr/bin/env bash

aws ecr get-login | bash
docker build -t ${REPOSITORY_NAME} .
docker tag ${REPOSITORY_NAME}:latest \
    ${REPOSITORY_URL}/${REPOSITORY_NAME}:latest
docker push ${REPOSITORY_URL}/${REPOSITORY_NAME}:latest