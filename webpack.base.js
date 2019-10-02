const fs = require('fs');
const jsonMinify = require('jsonminify'); // eslint-disable-line
const nodeExternals = require('webpack-node-externals');
const path = require('path');
const webpack = require('webpack');

const appVersion = getVersion();

module.exports = {
    entry: [path.resolve('./src/index.ts')],
    output: {
        path: path.resolve('./dist'),
        library: 'easy-template-x',
        libraryTarget: 'umd',
        umdNamedDefine: true,
        globalObject: 'this'
    },
    externals: [nodeExternals()],
    module: {
        rules: [{
            test: /.ts$/,
            use: 'babel-loader'
        }]
    },
    resolve: {
        extensions: ['.ts', '.js'],
        modules: [path.resolve('./src'), 'node_modules']
    },
    plugins: [
        new webpack.DefinePlugin({
            EASY_VERSION: JSON.stringify(appVersion)
        }),
        new webpack.optimize.ModuleConcatenationPlugin()
    ]
};

function getVersion() {
    const packageJson = readJsonFile('package.json');
    return packageJson.version;
}

function readJsonFile(jsonPath) {
    return JSON.parse(JSON.minify(fs.readFileSync(path.resolve(jsonPath), 'utf8')));
}