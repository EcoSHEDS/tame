# Cloudformation Commands

```sh
# load env variables (created from env.template.sh)
source .env.dev.local.sh
source .env.prod.local.sh

# create deployment bucket (must be done in separate stack so nested stacks can be packaged)
./create-s3.sh deployment ${DEPLOYMENT_BUCKET}

# create storage bucket (must be done in separate stack for chs CI/CD)
./create-s3.sh storage ${STORAGE_BUCKET}

# create website bucket (must be done in separate stack for chs CI/CD)
./create-s3.sh website ${WEBSITE_BUCKET}

# create auth
aws cloudformation create-stack --stack-name ${STACK_NAME}-auth --template-body file://templates/auth.yml --parameters file://parameters/auth.${ENV}.local.json ${OPT_ROLE_ARN}

# create db
aws cloudformation create-stack --stack-name ${STACK_NAME}-db --template-body file://templates/db.yml --parameters file://parameters/db.${ENV}.local.json ${OPT_ROLE_ARN}

# package lambda-api function
aws cloudformation package --template-file templates/lambda-api.yml --output-template-file templates/lambda-api.local.yml --s3-bucket ${DEPLOYMENT_BUCKET} --s3-prefix lambda-api

# create lambda-api function
aws cloudformation create-stack --stack-name ${STACK_NAME}-lambda-api --template-body file://templates/lambda-api.local.yml --parameters file://parameters/lambda-api.${ENV}.local.json ${OPT_ROLE_ARN} --capabilities CAPABILITY_NAMED_IAM

# update lambda-api function
aws cloudformation deploy --stack-name ${STACK_NAME}-lambda-api --template-file templates/lambda-api.local.yml --capabilities CAPABILITY_NAMED_IAM ${OPT_ROLE_ARN}

# create api
aws cloudformation create-stack --stack-name ${STACK_NAME}-api --template-body file://templates/api.yml --parameters file://parameters/api.${ENV}.local.json ${OPT_ROLE_ARN}

# update stack (api, auth, db)
export STACK_COMPONENT=api
aws cloudformation deploy --stack-name ${STACK_NAME}-${STACK_COMPONENT} --template-file templates/${STACK_COMPONENT}.yml --capabilities CAPABILITY_NAMED_IAM ${OPT_ROLE_ARN}

# with updated parameter
aws cloudformation deploy --stack-name ${STACK_NAME}-${STACK_COMPONENT} --template-file templates/${STACK_COMPONENT}.yml --parameter-overrides PARAMETER_KEY=PARAMETER_VALUE PARAMETER_KEY=PARAMETER_VALUE --capabilities CAPABILITY_NAMED_IAM ${OPT_ROLE_ARN}

# delete deployment bucket and stack
./delete-s3.sh deployment ${DEPLOYMENT_BUCKET}

# delete website bucket and stack
./delete-s3.sh website ${WEBSITE_BUCKET}

# delete storage bucket and stack
./delete-s3.sh storage ${STORAGE_BUCKET}
```

## Roles

Get current role

```
$ aws sts get-caller-identity
{
    "UserId": "AROA2DHXFQAOUGWJCLMNY:jdwalker@contractor.usgs.gov",
    "Account": "694155575325",
    "Arn": "arn:aws:sts::694155575325:assumed-role/adfs-developers/jdwalker@contractor.usgs.gov"
}
```

Assume `csr-cloudformation` role

```
$ aws sts assume-role --role-arn "arn:aws:iam::694155575325:role/csr-CloudFormation" --role-session-name AWSCLI-Session
```
