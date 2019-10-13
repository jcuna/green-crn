/* eslint-disable */
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = env => {
    const isDev = env.NODE_ENV === 'dev';
    const assetPath = 'dist/';

    return {
        entry: [
            '@babel/polyfill',
            path.resolve(__dirname, 'js/index.jsx'),
        ],
        output: {
            path: path.resolve(__dirname, 'public'),
            filename: assetPath + '[name].bundle.js',
            publicPath: '/',
        },
        resolve: {
            extensions: ['.js', '.jsx', '.css'],
        },
        module: {
            rules: [
                {
                    test: /\.jsx?/,
                    exclude: /node_modules/,
                    use: [
                        'babel-loader',
                        'eslint-loader',
                    ],
                },
                {
                    test: /\.scss$/,
                    use: [
                        isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
                        'css-loader',
                        'sass-loader',
                    ],
                },
            ],
        },
        plugins: [

            new HtmlWebpackPlugin({
                title: env.APP_NAME,
                hash: !isDev,
                template: 'index.html',
                favicon: 'favicon.ico',
                filename: 'index.html'
            }),

            new MiniCssExtractPlugin({
                filename: assetPath + '[name].style.css',
                chunkFilename: assetPath + 'vendor.style.css',
            }),
            new webpack.DefinePlugin({
                'env': {
                    NODE_ENV: JSON.stringify(env.NODE_ENV),
                },
            }),
        ],

        optimization: {
            splitChunks: {
                cacheGroups: {
                    vendor: {
                        test: /node_modules/,
                        chunks: 'initial',
                        name: 'vendor',
                        enforce: true,
                    },
                },
            },
        },

        devServer: {
            contentBase: path.resolve(__dirname, 'public/'),
            hot: true,
            compress: true,
            publicPath: '/',
            port: 3000,
            host: '0.0.0.0',
            disableHostCheck: true,
            historyApiFallback: true,
        },
    };
};
