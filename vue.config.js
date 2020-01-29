module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/dev/tame/' : '/',
  configureWebpack: {
    devtool: 'source-map'
  }
}
