import path from 'path'

export default {
  entry: './src/scripts/app.js',
  devtool: 'souce-map',
  module: {
    rules: [{
      test: /\.js$/,
      use:  {
        loader: 'babel-loader'
      },
      exclude: /(node_modules|bower_components)/,
    }]
  }
  // output: {
  //   path: path.join(__dirname, '.tmp/'),
  //   filename: '[name].js'
  // }
}
