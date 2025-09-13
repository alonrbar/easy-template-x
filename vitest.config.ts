import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        include: ['test/**/*.tests.ts'],
        globals: true,
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
