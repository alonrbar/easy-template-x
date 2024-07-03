import path from 'node:path';

export default {
    testEnvironment: "node",
    moduleFileExtensions: ["ts", "js", "json"],
    moduleDirectories: [path.resolve("."), "node_modules"],
    testRegex: "/test/.*[.]tests[.]ts$",
    snapshotSerializers: [
        '<rootDir>/test/xmlNodeSnapshotSerializer.ts'
    ],
    reporters: [
        "default",
        ["jest-junit", { outputDirectory: "test-reports" }],
        ["jest-html-reporters", {
            publicPath: "./test-reports",
            filename: "report.html",
            urlForTestFiles: "https://github.com/alonrbar/easy-template-x/blob/develop",
            inlineSource: true,
        }]
    ]
};
