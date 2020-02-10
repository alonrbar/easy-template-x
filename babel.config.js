const isJest = (process.env.NODE_ENV === 'test');

module.exports = {
    "presets": [
        "@babel/typescript"
    ],
    "plugins": [
        "ts-nameof",
        "@babel/proposal-class-properties",
        "@babel/proposal-object-rest-spread",
        "@babel/proposal-optional-catch-binding",
        "@babel/proposal-optional-chaining",
        isJest && '@babel/transform-modules-commonjs'
    ].filter(Boolean)
};
