# SHEDS: Tagged Animal Movement Explorer (TAME)

Jeffrey D Walker, PhD (@walkerjeffd)
[Walker Environmental Research, LLC](https://walkerenvres.com)

Benjamin Letcher, PhD (@bletcher)
USGS Conte Anadromous Fish Lab and UMass Amherst

## Project setup

Install dependencies

``` sh
yarn install
# or
npm install
```

## Configuration

### Data API

Data files are stored in the directory `public/data/` .

Set environmental variable `VUE_APP_API_BASEURL` to this path in the `.env` file:

``` sh
VUE_APP_API_BASEURL="data/"
```

The data URL can be defined for separate modes (development vs production) using mode-specific `.env` files (e.g. `.env.development` and `.env.production` ).

### Public Path

For the production version, set the root public path in `vue.config.js` . For development mode, leave as `/` .

``` js
{
    publicPath: process.env.NODE_ENV === 'production' ? '/dev/tame/' : '/'
}
```

## Run Development Server

To run the development server with HOT-reloading. The client will fetch the data whichever URL is set to `VUE_APP_API_BASEURL` in `.env` .

``` sh
yarn serve
# or
npm run serve
```

## Build and Deploy to Production

To build the production version, run the `build` command.

``` sh
yarn build
# or
npm run build
```

To deploy to the server run (note: this will also run `build` command first). Requires ssh access to `jeff@ecosheds.org` .

``` sh
yarn deploy
# or
npm run deploy
```

### Deploy to S3

```sh
aws s3 sync dist/ s3://<BUCKET_NAME>/<BASE_URL> --delete
aws s3 sync dist/ s3://conte-tame-website-dev/apps/ecosheds/tame --delete
```

## Cloud Formation Template

Set environmental variables

```
export ENV=dev COLOR=blue
```

For production, include IAM role `csr-CloudFormation` for all `create-stack` commands.

```
export IAM_ROLE="--role-arn arn:aws:iam::694155575325:role/csr-CloudFormation"
```

Otherwise

```
export IAM_ROLE=""
```

Create auth user pool. Only one used for both blue and green.

```
aws cloudformation create-stack --stack-name tame-auth --template-body file://aws/auth.yml --parameters file://aws/params/$ENV/auth.json $IAM_ROLE
aws cloudformation deploy --stack-name tame-auth --template-file ./aws/auth.yml
```

Create storage bucket (CHS-approval required).

```
aws cloudformation create-stack --stack-name tame-s3-storage --template-body file://aws/s3-storage.yml --parameters file://aws/params/$ENV/s3-storage.json
```

Create website bucket (CHS-approval required).

```
aws cloudformation create-stack --stack-name tame-s3-website --template-body file://aws/s3-website.yml --parameters file://aws/params/$ENV/s3-website.json
```

Create S3 bucket for deploying lambda code (`./api`).

```
aws cloudformation create-stack --stack-name tame-s3-lambda --template-body file://aws/s3-lambda.yml --parameters file://aws/params/$ENV/s3-lambda.json $IAM_ROLE
```

Create database.

```
aws cloudformation create-stack --stack-name tame-db --template-body file://aws/db.yml --parameters file://aws/params/$ENV/db.json $IAM_ROLE
```

Run `package` command to upload lambda source code to S3 deployment bucket and create `aws/lambda.yml` template.

```
aws cloudformation package --template aws/lambda-local.yml --s3-bucket usgs-chs-conte-$ENV-tame-lambda --s3-prefix lambda --output-template aws/lambda.yml
```

For CHS, uncomment `PermissionsBoundary` for the `LambdaExecutionRole` in `aws/lambda.yml`.

Create lambda.

```sh
aws cloudformation create-stack --stack-name tame-lambda --template-body file://aws/lambda.yml --parameters file://aws/params/$ENV/lambda.json --capabilities CAPABILITY_NAMED_IAM $IAM_ROLE

aws cloudformation deploy --stack-name tame-lambda --template-file aws/lambda.yml --capabilities CAPABILITY_NAMED_IAM
```

Copy User Pool ID to `aws/params/$ENV/api.json`.

Create API

```sh
aws cloudformation create-stack --stack-name tame-api --template-body file://aws/api.yml --parameters file://aws/params/$ENV/api.json $IAM_ROLE
aws cloudformation deploy --stack-name tame-api --template-file ./aws/api.yml
```

Update a stack

```sh
aws cloudformation deploy --stack-name tame-XXX --template-file aws/tame-XXX.yml --parameter-overrides XXX=XXX --capabilities XXX
```
