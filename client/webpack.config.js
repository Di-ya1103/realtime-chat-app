const path = require('path');

module.exports = {
  resolve: {
    fallback: {
      // Polyfills for socket.io-client and axios (if used)
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer/'),
      util: require.resolve('util/'),
      url: require.resolve('url/'),
      // Disable others not needed
      fs: false,
      path: false,
      os: false,
      net: false,
      tls: false,
      zlib: false,
      crypto: false,
      querystring: false,
      async_hooks: false,
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
};