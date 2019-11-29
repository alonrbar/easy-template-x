const fs = require('fs');
const jsonMinify = require('jsonminify'); // eslint-disable-line
const nodeExternals = require('webpack-node-externals');
const path = require('path');
const webpack = require('webpack');

const appVersion = getVersion();
const mode = process.env.NODE_ENV;

console.log(`Creating bundle. Version: ${appVersion}, Mode: ${mode}.`);

module.exports = {
    mode,
    entry: [path.resolve('./src/index.ts')],
    devtool: 'sourcemap',
    output: {
        path: path.resolve('./dist'),
        filename: 'easy-template-x.js',
        library: 'easy-template-x',
        libraryTarget: 'umd',
        umdNamedDefine: true,
        globalObject: 'this',
        devtoolModuleFilenameTemplate: '[absolute-resource-path]',
        devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]'
    },
    externals: [nodeExternals()],
    node: {
        Buffer: false
    },
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
    ],
    optimization: {
        noEmitOnErrors: true
    }
};

function getVersion() {
    const packageJson = readJsonFile('package.json');
    return packageJson.version;
}

function readJsonFile(jsonPath) {
    return JSON.parse(JSON.minify(fs.readFileSync(path.resolve(jsonPath), 'utf8')));
}
