const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  entry: './src/web/index.tsx',
  mode: 'development',
  devtool: 'nosources-source-map',
  module: {
    rules: [
        {
            test: /\.css$/,
            use: [
                MiniCssExtractPlugin.loader,
                {
                  loader: "css-loader",
                  options: {
                    importLoaders: 1,
                    modules: true
                  }
                }
            ],
            include: [
              path.resolve(__dirname, 'src/web/'),
            ],
        },
        {
            test: /\.css$/,
            use: ['style-loader', 'css-loader'],
            include: [
              path.resolve(__dirname, 'node_modules/bootstrap/dist/css/'),
              path.resolve(__dirname, 'node_modules/bootstrap-icons/font/'),
              path.resolve(__dirname, 'node_modules/@fontsource/roboto/'),
            ],
        },
        {
            test: /\.tsx?$/,
            use: [{
                loader: 'ts-loader',
                options: {
                    configFile: "src/web/tsconfig.json",
                    transpileOnly: true
                }
            }],
            include: [path.resolve(__dirname, 'src/')],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: "asset/resource",
          generator: { filename: 'img/[name][ext]' },
          include: [path.resolve(__dirname, 'src/web/')],
        },
        {
          test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
          type: "asset/resource",
          generator: { filename: 'font/[name][ext]' },
          include: [
            path.resolve(__dirname, 'node_modules/@fontsource/roboto/'),
          ],
        },
        {
          test: /\.(html|js)$/i,
          type: "asset/resource",
          generator: { filename: '[name][ext]' },
          include: [path.resolve(__dirname, 'src/web/')],
        },
        {
          test: /\.js$/,
          enforce: 'pre',
          use: ['source-map-loader'],
        },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'build/http/public'),
    clean: true,
  },
  plugins: [
    new MiniCssExtractPlugin({
        filename: 'index.css',
    }),
  ],
  optimization: {
    usedExports: true,
    minimize: true,
    minimizer: [new TerserPlugin({
      minify: TerserPlugin.uglifyJsMinify,
      terserOptions: {},
    })],
  },
};
