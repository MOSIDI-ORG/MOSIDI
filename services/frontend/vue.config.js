const { defineConfig } = require('@vue/cli-service')
const config = require('./src/config.json')
const path = require('path')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: "/app/",
  devServer: {
    historyApiFallback: {
      rewrites: [
        { from: /^\/landing-page/, to: '/landing-page/index.html' }
      ]
    },
    // Enable Hot Reload
    host: "0.0.0.0",
    port: 8087,
    watchFiles: {
      paths: ["src/**/*"],
      options: {
        usePolling: true,
      },
    },
  },
  pages: {
    index: {
      // entry for the page
      entry: 'src/main.js',
      // the source template
      template: 'public/index.html',
      // output as dist/index.html
      filename: 'index.html',
      // when using title option,
      // template title tag needs to be <title><%= htmlWebpackPlugin.options.title %></title>
      title: config.title,
      favicon: path.resolve(__dirname, 'public', config.favicon),
      // chunks to include on this page, by default includes
      // extracted common chunks and vendor chunks.
      chunks: ['chunk-vendors', 'chunk-common', 'index']
    }
  },
})
