const { ProvidePlugin } = require('webpack');

/** @type {import('webpack').Configuration} */
module.exports = {
    // root of the monorepo, so that paths in output will be clickable
    context: __dirname,

    // works great. with the default 'eval', imports are not mapped.
    devtool: 'source-map',

    resolve: {
        extensions: ['.ts', '.tsx', '.mjs', '.js', '.json'],
        fallback: {
            util: require.resolve('util/'),
            path: false,
            fs: false,
        },
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                enforce: 'pre',
                loader: 'source-map-loader',
            },
        ],
    },
};
