const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    mode: 'development',
    entry: './test/main.ts',
    target: 'node',
    devtool: 'inline-cheap-module-source-map',
    output: {
        filename: 'test-bundle.js',
        path: path.resolve('.tmp/test/_compiled'),
        devtoolModuleFilenameTemplate: '[absolute-resource-path]',
        devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]'
    },
    externals: [nodeExternals()],
    module: {
        rules: [
            { test: /.ts$/, use: ['ts-loader', 'ts-nameof-loader'] }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js'],
        modules: [path.resolve("."), path.resolve("./src"), path.resolve("./test"), "node_modules"]
    },
    plugins: [
        new webpack.LoaderOptionsPlugin({ debug: true }),
        new webpack.optimize.ModuleConcatenationPlugin()        
    ]
};