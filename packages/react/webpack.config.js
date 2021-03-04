const HtmlWebPackPlugin = require('html-webpack-plugin');

const mode = process.env.NODE_ENV || 'development';

/** @type {import('webpack').Configuration} */
module.exports = {
    entry: { demo: `./dist/demo/index.js` },

    devtool: 'source-map',

    mode,

    resolve: {
        extensions: ['.mjs', '.js', '.json'],
    },

    plugins: [
        new HtmlWebPackPlugin({
            template: './demo/index.html',
            filename: './index.html',
            chunks: ['demo'],
        }),
    ],
};
