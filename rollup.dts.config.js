import { dts } from 'rollup-plugin-dts';
import alias from '@rollup/plugin-alias';
import path from 'path';

export default {
    input: 'src/index.ts',
    output: {
        file: 'dist/types/index.d.ts',
        format: 'es'
    },
    plugins: [
        alias({
            entries: [{
                find: 'src',
                replacement: path.resolve(process.cwd(), 'src')
            }]
        }),
        dts()
    ]
};
