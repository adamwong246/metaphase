const webpack = require('webpack');
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const isProduction = process.env.NODE_ENV == "production";

const stylesHandler = "style-loader";

const config = {
  target: "node",
  entry: "./src/server/udpServer.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: 'udp.bundle.js',
  },

  externals: [
    "mongodb-client-encryption",
    "commonjs canvas"
  ],

  plugins: [
    new webpack.DefinePlugin({
      navigator: { userAgent: "'node'" }
    })
  ],

  module: {
    rules: [

      {
        test: /\.(ts|tsx)$/i,
        loader: "ts-loader",
        exclude: ["/node_modules/"],
      },
      {
        test: /\.node$/,
        loader: "node-loader",
      }
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".json"],
    fallback: {
      assert: require.resolve('assert'),
      crypto: require.resolve('crypto-browserify'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      stream: require.resolve('stream-browserify'),
      zlib: require.resolve('browserify-zlib'),
    },
  },

  experiments: {
    topLevelAwait: true
  }

};

module.exports = () => {
  if (isProduction) {
    config.mode = "production";
  } else {
    config.mode = "development";
  }
  return config;
};
