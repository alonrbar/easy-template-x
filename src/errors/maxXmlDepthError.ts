import { TemplateFileError } from "./templateFileError";

export class MaxXmlDepthError extends TemplateFileError {

    public readonly maxDepth: number;

    constructor(maxDepth: number) {
        super(`XML maximum depth reached (max depth: ${maxDepth}).`);

        this.maxDepth = maxDepth;
    }
}
