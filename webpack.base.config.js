const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [{
        test: /\.(gif|png|jpe?g|svg)$/i,
        use: [
            'file-loader',
            {
                loader: 'image-webpack-loader',
                options: {
                    disable: true,
                },  
            },
        ],
    }],
  },
  resolve: {
    alias: {
      three$: 'three/build/three.min.js',
      'three/.*$': 'three',
    },
  },
  plugins: [
      new webpack.ProvidePlugin({
        THREE: 'three',
      }),
  ],
};