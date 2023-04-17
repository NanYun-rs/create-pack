const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  mode: "production",
  entry: {
    "1.0.0/index": [path.resolve(__dirname, "../src/index.ts")],
  },
  target: ["web", "es5"],
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, `../dist`),
    library: {
      name: "_",
      type: "window",
      export: "default",
    },
  },
  module: {
    rules: [
      {
        test: /\.(t|j)s$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
            plugins: [
              [
                "@babel/plugin-transform-runtime",
                {
                  corejs: 3,
                  regenerator: true,
                  absoluteRuntime: true,
                },
              ],
              ["@babel/plugin-transform-typescript"],
            ],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      "@": path.resolve(process.cwd(), "src"),
    },
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
          },
        },
      }),
    ],
  },
  plugins: [new CleanWebpackPlugin()],
};
