module.exports = {
  publicPath: process.env.BASE_URL || '/',
  configureWebpack: {
    devtool: 'source-map'
  }
}
