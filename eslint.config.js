// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config({
    files: ['**/*.ts'],
    extends: [
        eslint.configs.recommended,
        ...tseslint.configs.recommended,
    ],
    rules: {
        "@typescript-eslint/camelcase": "off",
        "@typescript-eslint/class-name-casing": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/explicit-member-accessibility": "off",
        "indent": ["error", 4, {
            "flatTernaryExpressions": true,
            "SwitchCase": 1
        }],
        "@typescript-eslint/interface-name-prefix": "off",
        "@typescript-eslint/member-ordering": [
            "error",
            {
                "default": [
                    "public-static-field",
                    "protected-static-field",
                    "private-static-field",
                    "public-static-method",
                    "protected-static-method",
                    "private-static-method",
                    "public-instance-field",
                    "protected-instance-field",
                    "private-instance-field",
                    "constructor",
                    "public-instance-method",
                    "protected-instance-method",
                    "private-instance-method"
                ]
            }
        ],
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-inferrable-types": "off",
        "@typescript-eslint/no-object-literal-type-assertion": "off",
        "@typescript-eslint/no-parameter-properties": "off",
        "@typescript-eslint/no-unused-vars": ["error", { "args": "none" }],
        "@typescript-eslint/no-use-before-define": "off",
        "@typescript-eslint/no-var-requires": "off",
        "linebreak-style": "off",
        "no-multiple-empty-lines": ["error", { "max": 1 }],
        "no-unreachable": "error",
        "no-var": "error",
        "prefer-const": "error",
        "semi": ["error", "always"]
    },
});
