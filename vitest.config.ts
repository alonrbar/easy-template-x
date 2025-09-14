import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        environment: 'node',
        include: ['test/**/*.tests.ts'],
        snapshotSerializers: ['./test/xmlNodeSnapshotSerializer.ts'],
        reporters: process.env.GITHUB_ACTIONS ?
            ['default', 'junit', 'github-actions'] :
            ['default'],
        outputFile: {
            html: './test-reports/report.html',
            junit: './test-reports/junit.xml'
        }
    },
});
