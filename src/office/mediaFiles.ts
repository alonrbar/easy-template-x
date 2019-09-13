import * as JSZip from 'jszip';
import { MimeType, MimeTypeHelper } from '../mimeType';
import { Binary, Path, sha1 } from '../utils';

/**
 * Handles media files of the main document.
 */
export class MediaFiles {

    private static readonly mediaDir = 'word/media';

    private fileHashes: IMap<string>;
    private nextFileId = 0;

    constructor(private readonly zip: JSZip) {
    }

    /**
     * Returns the media file path.
     */
    public async add(mediaFile: Binary, mime: MimeType): Promise<string> {

        // hash existing media files
        await this.hashMediaFiles();

        // hash the new file  
        // Note: Even though hashing the base64 string may seem inefficient
        // (requires extra step in some cases) in practice it is significantly
        // faster than hashing a 'binarystring'.
        const base64 = await Binary.toBase64(mediaFile);
        const hash = sha1(base64);

        // check if file already exists
        // note: this can be optimized by keeping both mapping by filename as well as by hash
        let filename = Object.keys(this.fileHashes).find(filename => this.fileHashes[filename] === hash);
        let fullPath = `${MediaFiles.mediaDir}/${filename}`;

        // add new file to the zip
        if (!filename) {

            // generate unique media file name
            const extension = MimeTypeHelper.getDefaultExtension(mime);
            do {
                this.nextFileId++;
                filename = `media${this.nextFileId}.${extension}`;
            } while (this.fileHashes[filename]);
            fullPath = `${MediaFiles.mediaDir}/${filename}`;

            // add media to zip
            await this.zip.file(fullPath, mediaFile);

            // add media to our hash lookup
            this.fileHashes[filename] = hash;
        }

        // return
        return fullPath;
    }

    public async count(): Promise<number> {
        await this.hashMediaFiles();
        return Object.keys(this.fileHashes).length;
    }    

    private async hashMediaFiles(): Promise<void> {
        if (this.fileHashes)
            return;

        this.fileHashes = {};
        for (const path of Object.keys(this.zip.files)) {

            if (!path.startsWith(MediaFiles.mediaDir))
                continue;

            const filename = Path.getFilename(path);
            if (!filename)
                continue;

            const fileData = await this.zip.file(path).async('base64');
            const fileHash = sha1(fileData);
            this.fileHashes[filename] = fileHash;
        }
    }
}