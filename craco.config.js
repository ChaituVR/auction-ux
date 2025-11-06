const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // For webpack 4 (react-scripts 4.x), we need to use node property instead of fallback
      webpackConfig.node = {
        ...webpackConfig.node,
        process: true,
        Buffer: true,
      };

      // Add plugins for providing Node.js globals
      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        })
      );

      // Fix for @metamask/safe-event-emitter ESM/CJS issue
      webpackConfig.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      });

      return webpackConfig;
    },
  },
  eslint: {
    enable: false,
  },
  typescript: {
    enableTypeChecking: false,
  },
};
