import { defineConfig } from 'vitest/config';

export default defineConfig({
    resolve: {
        tsconfigPaths: true,
    },
    test: {
        environment: 'node',
        include: ['src/**/*.tests.ts', 'test/**/*.tests.ts'],
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
