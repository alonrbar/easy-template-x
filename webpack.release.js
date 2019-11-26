const merge = require("webpack-merge");
const base = require("./webpack.base.js");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = merge(base, {
    mode: "production",
    output: {
        filename: "easy-template-x.min.js"
    },
    optimization: {
        noEmitOnErrors: true,
        minimizer: [
            new TerserPlugin({
                parallel: true,
                sourceMap: false
            })
        ]
    }
});
