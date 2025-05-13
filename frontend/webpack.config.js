const path = require('path');
const BundleTracker = require('webpack-bundle-tracker');

module.exports = {
  mode: 'development',
  entry: {
    main: './src/index.js',
  },
  output: {
    path: path.resolve('../static/frontend/'),
    filename: '[name]-[fullhash].js',
    publicPath: '/static/frontend/'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new BundleTracker({
      path: __dirname,
      filename: './webpack-stats.json'
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx']
  }
};