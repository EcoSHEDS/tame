# Tagged Animal Movement Explorer (TAME)

Jeffrey D Walker, PhD  
[Walker Environmental Research, LLC](https://walkerenvres.com)

Benjamin Letcher, PhD  
[USGS Conte Anadromous Fish Lab and UMass Amherst](https://www.usgs.gov/staff-profiles/benjamin-h-letcher)

## About

The Tagged Animal Movement Explorer (TAME) is an interactive data visualization tool for exploring spatial and temporal patterns of animal movements. It is part of the Spatial Hydro-Ecological Decision System ([EcoSHEDS](https://ecosheds.org)).

TAME was funded by the [USGS Community for Data Integration (CDI)](https://www.usgs.gov/centers/cdi).

## Client Application

### Project setup

Install dependencies

```sh
yarn install
```

### Configuration

The application is configured using environmental variables defined in one or more `.env` files.

Each variable can be defined differently for separate modes (development vs production) using mode-specific `.env` files (e.g. `.env.development` and `.env.production` ). See [Modes and Environment Variables](https://cli.vuejs.org/guide/mode-and-env.html) of Vue CLI guide.

The following variables must be defined:

```env
BASE_URL="/"                     # base URL when deployed
VUE_APP_USGS=false               # true/false to show USGS banners (false for ecosheds.org, true for usgs.gov)
VUE_APP_BASE_URL=""              # base URL to application for generating project URLs
VUE_APP_API_BASE_URL=""          # API URL (AWS API Gateway endpoint)
VUE_APP_COGNITO_REGION=""        # AWS Cognito Region
VUE_APP_COGNITO_USER_POOL_ID=""  # AWS Cognito User Pool ID
VUE_APP_COGNITO_CLIENT_ID=""     # AWS Cognito Client App Key
```

### Run Development Server

To run the development server with HOT-reloading.

``` sh
yarn serve
```

### Build and Deploy to Production

To build the production version of the application, run the `build` command.

``` sh
yarn build
```

### Deploy to S3 Bucket

Use the AWS CLI to deploy the built front-end assets (HTML, CSS, JS) to the S3 bucket used for hosting.

```sh
aws s3 sync dist/ s3://<BUCKET_NAME>/<BASE_URL> --delete
```

## API

The TAME API server code is located in the `api/` directory. This code is designed to run as an AWS Lambda Function (see Cloud Infrastructure below).

### Set Up

Install packages

```
cd api
yarn install
```

### Configuration

The API is configured by the following environmental variables

```
TABLE_NAME=""  # name of DynamoDB table
S3_BUCKET=""   # name of S3 bucket for dataset file storage
REGION=""      # S3 bucket region
```

### Run Development Server

To run a development server, set the environmental variables in the termal and call `npm start` (requires `nodemon`).

```
yarn global add nodemon # if not already installed
TABLE_NAME=my-table S3_BUCKET=my-bucket REGION=us-east-1 npm start
```

## Cloud Infrastructure

TAME uses a serverless application architecture built upon Amazon Web Services (via USGS Cloud Hosting Solutions).

This infrastructure includes the following resources:

1. Cognito User Pool - user account management
2. DynamoDB Table - stores metadata of each project
3. Lambda Function - a Node.js Express API server, proxied by the API Gateway
4. API Gateway - REST API with Cognito authorization proxying the Lambda function
5. S3 Bucket for Lambda - stores lambda function source code
6. S3 Bucket for Storage - stores dataset files for projects
7. S3 Bucket for Website - hosts front-end assets of the web application

TAME adheres to the "Infrastructure as Code" approach by using CloudFormation templates to define and manage each resource. For security purposes, these templates are not publicly available.

# License

See `LICENSE` file.

# Disclaimer

This software is in the public domain because it contains materials that
originally came from the U.S. Geological Survey, an agency of the United
States Department of Interior. For more information, see the [official
USGS copyright
policy](https://www2.usgs.gov/visual-id/credit_usgs.html#copyright)

Although this software program has been used by the U.S. Geological
Survey (USGS), no warranty, expressed or implied, is made by the USGS or
the U.S. Government as to the accuracy and functioning of the program
and related program material nor shall the fact of distribution
constitute any such warranty, and no responsibility is assumed by the
USGS in connection therewith.

This software is provided "AS IS."

