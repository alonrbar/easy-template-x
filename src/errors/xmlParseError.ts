export class XmlParseError extends Error {

    /**
     * Zero-based character offset into the parsed string.
     */
    public readonly position: number;
    /**
     * One-based line number.
     */
    public readonly line: number;
    /**
     * One-based column number (in characters, tabs count as one).
     */
    public readonly column: number;

    constructor(message: string, position: number, line: number, column: number) {
        super(`Failed to parse XML at line ${line}, column ${column}: ${message}`);

        this.position = position;
        this.line = line;
        this.column = column;
    }
}
