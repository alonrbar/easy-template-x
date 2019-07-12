import * as fs from 'fs';

export function readFixture(filename: string): Buffer {
    return fs.readFileSync("./test/fixtures/files/" + filename);
}

export function writeTempFile(file: Buffer, filename: string): string {
    const path = '/temp/' + filename;
    fs.writeFileSync(path, file);
    return path;
}