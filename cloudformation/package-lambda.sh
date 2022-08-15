#!/bin/bash
# package lambda function and upload to S3
# usage: ./package-lambda.sh <lambda name>

NAME=$1

aws cloudformation package --template-file templates/lambda-${NAME}.yml --use-json --output-template-file templates/lambda-${NAME}.local.yml --s3-bucket ${DEPLOYMENT_BUCKET} --s3-prefix lambda-${NAME}
