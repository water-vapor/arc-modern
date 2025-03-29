module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/arc-modern/'  // Repository name on water-vapor's GitHub
    : '/',
  outputDir: 'dist',
  assetsDir: '',
  productionSourceMap: false,
  css: {
    sourceMap: true
  },
  configureWebpack: {
    optimization: {
      splitChunks: {
        minSize: 10000,
        maxSize: 250000,
      }
    }
  }
} 