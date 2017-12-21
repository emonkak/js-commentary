const path = require('path');

const config = {
    entry: {
        'browser': './browser.js'
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js'
    },
    resolve: {
        modules: [
            path.join(__dirname, 'lib'),
            'node_modules'
        ],
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader'
            }
        ]
    }
};

module.exports = config;
