module.exports = {
    "presets": [
        ["@babel/preset-env", {
            targets: {
                chrome: 97 // https://caniuse.com/?search=es2022
            }
        }],
        "@babel/typescript"
    ],
    "plugins": [
        "ts-nameof"
    ]
};
