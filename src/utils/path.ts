export class Path {

    public static getFilename(path: string): string {
        const lastSlashIndex = path.lastIndexOf('/');
        return path.substr(lastSlashIndex + 1);
    }

    public static getDirectory(path: string): string {
        const lastSlashIndex = path.lastIndexOf('/');
        return path.substring(0, lastSlashIndex);
    }
}