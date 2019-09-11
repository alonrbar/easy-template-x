import * as fs from 'fs';

export function readFixture(filename: string): Buffer {
    return fs.readFileSync("./test/fixtures/files/" + filename);
}