const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const { webpack } = require('webpack');

module.exports = {
   entry: {
      background: path.resolve(__dirname, "..", "src", "background.ts"),
      popup: path.resolve(__dirname, "..", "src", "popup.ts"),
      contentscript: path.resolve(__dirname, "..", "src", "contentscript.ts")
   },
   output: {
      path: path.join(__dirname, "../dist"),
      filename: "[name].js",
   },
   resolve: {
      extensions: [".ts", ".js"],
   },
   cache: {
      type: 'filesystem',
      allowCollectingMemory: true,
   },
   module: {
      rules: [
         {
            test: /\.tsx?$/,
            loader: "ts-loader",
            exclude: /node_modules/,
         },
      ],
   },
   plugins: [
      new CopyPlugin({
         patterns: [{from: ".", to: ".", context: "public"}]
      })
   ],
};