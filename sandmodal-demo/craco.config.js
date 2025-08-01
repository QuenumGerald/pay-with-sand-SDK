const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

module.exports = {
  webpack: {
    plugins: [
      new NodePolyfillPlugin(),
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process',
      }),
    ],
    configure: (webpackConfig) => {
      // Disable ModuleScopePlugin which restricts imports to src/
      const moduleScopePlugin = webpackConfig.resolve.plugins.find(
        (plugin) => plugin.constructor.name === 'ModuleScopePlugin'
      );
      if (moduleScopePlugin) {
        webpackConfig.resolve.plugins = webpackConfig.resolve.plugins.filter(
          (plugin) => plugin.constructor.name !== 'ModuleScopePlugin'
        );
      }

      // Disable ESM path enforcement
      webpackConfig.module.rules.push({
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
      });

      return webpackConfig;
    },
  },
};
