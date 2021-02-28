const { join } = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const mode = process.env.NODE_ENV || 'development';
const prod = mode === 'production';

module.exports = {
    entry: { demo: `./demo/index.ts` },
    resolve: {
        extensions: ['.mjs', '.js', '.svelte', '.ts', '.tsx', '.json'],
        mainFields: ['svelte', 'browser', 'module', 'main'],
        plugins: [
            new TsconfigPathsPlugin({ configFile: join(__dirname, `..`, `..`, 'tsconfig.json') }),
        ],
    },
    output: {
        path: __dirname + '/public',
        filename: '[name].js',
        chunkFilename: '[name].[id].js',
    },
    module: {
        rules: [
            {
                test: /\.svelte$/,
                exclude: /node_modules/,
                use: {
                    loader: 'svelte-loader',
                    options: {
                        emitCss: true,
                        hotReload: true,
                        compilerOptions: {
                            generate: `dom`,
                            hydratable: true,
                        },
                    },
                },
            },
            {
                // required to prevent errors from Svelte on Webpack 5+
                test: /node_modules\/svelte\/.*\.mjs$/,
                resolve: {
                    fullySpecified: false,
                },
            },
            {
                test: /\.tsx?$/,
                loader: '@ts-tools/webpack-loader',
            },
            {
                test: /\.css$/,
                use: [
                    /**
                     * MiniCssExtractPlugin doesn't support HMR.
                     * For developing, use 'style-loader' instead.
                     * */
                    prod ? MiniCssExtractPlugin.loader : 'style-loader',
                    'css-loader',
                ],
            },
        ],
    },
    mode,
    plugins: [
        // new MiniCssExtractPlugin({
        // 	filename: '[name].css'
        // })
        new HtmlWebPackPlugin({
            template: './demo/index.html',
            filename: './index.html',
            chunks: ['main'],
        }),
    ],
    devtool: prod ? false : 'source-map',
};
