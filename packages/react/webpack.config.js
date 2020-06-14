const { join } = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const HtmlWebPackPlugin = require('html-webpack-plugin');

const monorepoRoot = join(__dirname, '..', '..');

module.exports = {
    entry: { demo: `./demo/index.tsx` },

    devtool: 'source-map',

    resolve: {
        extensions: ['.ts', '.tsx', '.mjs', '.js', '.json'],
        plugins: [new TsconfigPathsPlugin({ configFile: join(monorepoRoot, 'tsconfig.json') })],
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: '@ts-tools/webpack-loader',
            },
        ],
    },

    plugins: [
        new HtmlWebPackPlugin({
            template: './demo/index.html',
            filename: './index.html',
            chunks: ['demo'],
        }),
    ],
};
