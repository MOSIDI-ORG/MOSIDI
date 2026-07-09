const { defineConfig } = require('@vue/cli-service')
// Only used to seed the static <title>/favicon in the built index.html.
// The app itself loads its config at runtime from public/configs/*.json.
const config = require('./public/configs/default.json')
const path = require('path')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: "/app/",
  devServer: {
    historyApiFallback: {
      rewrites: [
        { from: /^\/landing-page/, to: '/landing-page/index.html' }
      ]
    }
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
