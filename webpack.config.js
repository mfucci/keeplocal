const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: './src/web/index.tsx',
  mode: 'development',
  devtool: 'source-map',
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
            include: [path.resolve(__dirname, 'src/')],
        },
        {
            test: /\.tsx?$/,
            use: [{
                loader: 'ts-loader',
                options: {
                    configFile: "src/web/tsconfig.json"
                }
            }],
            include: [path.resolve(__dirname, 'src/')],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: "asset/resource",
          generator: { filename: 'img/[name][ext]' },
          include: [path.resolve(__dirname, 'src/')],
        },
        {
          test: /\.(html)$/i,
          type: "asset/resource",
          generator: { filename: '[name][ext]' },
          include: [path.resolve(__dirname, 'src/')],
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
};