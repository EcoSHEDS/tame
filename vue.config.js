module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/dev/tame2/' : '/',
  configureWebpack: {
    devtool: 'source-map'
  }
}
