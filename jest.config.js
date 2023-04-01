const path = require('path');

module.exports = {
    testEnvironment: "node",
    moduleFileExtensions: ["ts", "js", "json"],
    moduleDirectories: [path.resolve("."), "node_modules"],
    testRegex: "/test/.*[.]tests[.]ts$",
    snapshotSerializers: [
        '<rootDir>/test/xmlNodeSnapshotSerializer.ts'
    ],
    reporters: [
        "default",
        ["jest-junit", { outputDirectory: "test-reports" }]
    ]
};
