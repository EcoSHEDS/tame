import Vue from 'vue'
import Amplify, * as AmplifyModules from 'aws-amplify'
import { AmplifyPlugin } from 'aws-amplify-vue'
// import awsconfig from '../aws-exports'
Amplify.configure({
  Auth: {
    region: process.env.VUE_APP_COGNITO_REGION,
    identityPoolId: process.env.VUE_APP_COGNITO_IDENTITY_POOL_ID,
    userPoolId: process.env.VUE_APP_COGNITO_USER_POOL_ID,
    userPoolWebClientId: process.env.VUE_APP_COGNITO_CLIENT_ID
  },
  Storage: {
    region: process.env.VUE_APP_S3_REGION,
    bucket: process.env.VUE_APP_S3_BUCKET
  },
  API: {
    endpoints: [
      {
        name: 'tame',
        endpoint: 'https://x51i2beykf.execute-api.us-east-1.amazonaws.com/dev'
      }
    ]
  }
})

Vue.use(AmplifyPlugin, AmplifyModules)
