export class Path {

    public static getFilename(path: string): string {
        const lastSlashIndex = path.lastIndexOf('/');
        return path.substr(lastSlashIndex + 1);
    }

    public static getDirectory(path: string): string {
        const lastSlashIndex = path.lastIndexOf('/');
        return path.substring(0, lastSlashIndex);
    }

    public static combine(...parts: string[]): string {
        const normalizedParts = parts.flatMap(part => part?.split('/')?.map(p => p.trim()).filter(Boolean));

        // Handle . and .. parts
        const resolvedParts: string[] = [];
        for (const part of normalizedParts) {

            if (part === '.') {
                continue; // Ignore . parts
            }

            if (part === '..') {
                resolvedParts.pop(); // Go up one directory
                continue;
            }

            resolvedParts.push(part);
        }

        return resolvedParts.join('/');
    }
}
