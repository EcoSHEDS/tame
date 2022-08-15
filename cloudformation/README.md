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

# package lambda functions (must be done first to avoid s3-prefix clash)
./package-lambda.sh api

# create stack (api, auth, db)
export STACK_COMPONENT=api
aws cloudformation create-stack --stack-name ${STACK_NAME}-${STACK_COMPONENT} --template-body file://templates/${STACK_COMPONENT}.yml --parameters file://parameters/${STACK_COMPONENT}.${ENV}.local.json ${OPT_ROLE_ARN}

# update stack (api, auth, db)
export STACK_COMPONENT=api
aws cloudformation deploy --stack-name ${STACK_NAME}-${STACK_COMPONENT} --template-file templates/${STACK_COMPONENT}.yml --capabilities CAPABILITY_NAMED_IAM ${OPT_ROLE_ARN}
# with updated parameter
aws cloudformation deploy --stack-name ${STACK_NAME}-${STACK_COMPONENT} --template-file templates/${STACK_COMPONENT}.yml --parameter-overrides PARAMETER_KEY=PARAMETER_VALUE PARAMETER_KEY=PARAMETER_VALUE --capabilities CAPABILITY_NAMED_IAM ${OPT_ROLE_ARN}

# create (use packaged template)
./create.sh parameters/root.${ENV}.local.json
# aws cloudformation create-stack --stack-name ${STACK_NAME} --template-body file://root.local.json --parameters file://root-parameters/root.json --capabilities CAPABILITY_NAMED_IAM

# create SNS subscriptions
cp templates/subscriptions.template.json templates/subscriptions.${ENV}.local.json
# edit templates/subscriptions.${ENV}.local.json
./create-subscriptions.sh parameters/subscriptions.${ENV}.local.json

# add trigger to auth
aws cloudformation deploy --stack-name ${STACK_NAME}-auth --template-file templates/auth.json --capabilities CAPABILITY_NAMED_IAM --parameter-overrides lambdaTriggerArn=arn:aws:lambda:us-east-1:474916309046:function:${APP_NAME}-${ENV}-lambda-trigger

# update (use packaged template)
./deploy.sh
# aws cloudformation deploy --stack-name ${STACK_NAME} --template-file root.dev.local.json --capabilities CAPABILITY_NAMED_IAM

# repackage and deploy
./update-all.sh

# repackage and deploy root only (no lambdas)
./update.sh

# delete
./delete.sh
# aws cloudformation delete-stack --stack-name ${STACK_NAME}

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
