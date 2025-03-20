import autoExternal from 'rollup-plugin-auto-external';
import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import alias from '@rollup/plugin-alias';
import path from 'path';

import pkg from './package.json' with { type: "json" };

const extensions = ['.ts'];

export default {
    input: 'src/index.ts',
    output: [
        {
            file: 'dist/cjs/easy-template-x.cjs',
            format: 'cjs'
        },
        {
            file: 'dist/es/easy-template-x.mjs',
            format: 'es'
        }
    ],
    plugins: [
        alias({
            entries: [{
                find: 'src',
                replacement: path.resolve(process.cwd(), 'src')
            }]
        }),
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
