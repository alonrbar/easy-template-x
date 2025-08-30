import { MimeType, MimeTypeHelper } from '../mimeType';
import { IMap } from '../types';
import { Binary, Path, sha1 } from '../utils';
import { Zip } from '../zip';

/**
 * Handles media files of the main document.
 */
export class MediaFiles {

    private static readonly mediaDir = 'word/media';

    private hashes: IMap<string>;
    private readonly files = new Map<Binary, string>();
    private nextFileId = 0;

    private readonly zip: Zip;

    constructor(zip: Zip) {
        this.zip = zip;
    }

    /**
     * Returns the media file path.
     */
    public async add(mediaFile: Binary, mime: MimeType): Promise<string> {

        // Check if already added
        if (this.files.has(mediaFile))
            return this.files.get(mediaFile);

        // Hash existing media files
        await this.hashMediaFiles();

        // Hash the new file
        // Note: Even though hashing the base64 string may seem inefficient
        // (requires extra step in some cases) in practice it is significantly
        // faster than hashing a 'binarystring'.
        const base64 = await Binary.toBase64(mediaFile);
        const hash = sha1(base64);

        // Check if file already exists
        // Note: this can be optimized by keeping both mapping by filename as well as by hash
        let path = Object.keys(this.hashes).find(p => this.hashes[p] === hash);
        if (path)
            return path;

        // Generate unique media file name
        const baseFilename = this.baseFilename(mime);
        const extension = MimeTypeHelper.getDefaultExtension(mime);
        do {
            this.nextFileId++;
            path = `${MediaFiles.mediaDir}/${baseFilename}${this.nextFileId}.${extension}`;
        } while (this.hashes[path]);

        // Add media to zip
        this.zip.setFile(path, mediaFile);

        // Add media to our lookups
        this.hashes[path] = hash;
        this.files.set(mediaFile, path);

        return path;
    }

    public async count(): Promise<number> {
        await this.hashMediaFiles();
        return Object.keys(this.hashes).length;
    }

    private async hashMediaFiles(): Promise<void> {
        if (this.hashes)
            return;

        this.hashes = {};
        for (const path of this.zip.listFiles()) {

            if (!path.startsWith(MediaFiles.mediaDir))
                continue;

            const filename = Path.getFilename(path);
            if (!filename)
                continue;

            const fileData = await this.zip.getFile(path).getContentBase64();
            const fileHash = sha1(fileData);
            this.hashes[path] = fileHash;
        }
    }

    private baseFilename(mime: MimeType): string {
        // Naive heuristic.
        // May need to be modified if we're going to support more mime types.
        const parts = mime.split('/');
        return parts[0];
    }
}
