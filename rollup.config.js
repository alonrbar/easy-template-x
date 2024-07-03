import autoExternal from 'rollup-plugin-auto-external';
import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';
import replace from '@rollup/plugin-replace';

import pkg from './package.json' with { type: "json" };

const extensions = ['.ts'];

export default {
    input: 'src/index.ts',
    output: [
        {
            file: 'dist/cjs/easy-template-x.js',
            format: 'cjs'
        },
        {
            file: 'dist/es/easy-template-x.js',
            format: 'es'
        }
    ],
    plugins: [
        autoExternal(),
        nodeResolve({
            extensions
        }),
        replace({
            // replace options
            preventAssignment: true,

            // keywords:
            EASY_VERSION: JSON.stringify(pkg.version)
        }),
        babel({
            extensions,
        })
    ]
};
