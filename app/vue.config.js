const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true
})

// module.exports = {
//   publicPath: process.env.BASE_URL || '/',
//   configureWebpack: {
//     devtool: 'source-map'
//   },
//   chainWebpack: config => {
//     if (process.env.NODE_ENV === 'development') {
//       config
//         .output
//         .filename('[name].[hash].js')
//         .end()
//     }
//   }
// }
