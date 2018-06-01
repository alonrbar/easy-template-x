import { XmlParser } from "./xmlParser";

export class Delimiters {
    public start = "{";
    public end = "}";

    constructor(initial?: Delimiters) {
        if (initial) {

            if (initial.start)
                this.start = XmlParser.encode(initial.start);

            if (initial.end)
                this.end = XmlParser.encode(initial.end);

        }

        if (!this.start || !this.end)
            throw new Error('Both delimiters must be specified.');

        if (this.start === this.end)
            throw new Error('Start and end delimiters can not be the same.');
    }

}