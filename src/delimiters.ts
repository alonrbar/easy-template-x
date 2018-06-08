import { XmlNode } from "./xmlNode";

export class Delimiters {

    public start = "{";
    public end = "}";

    constructor(initial?: Delimiters) {
        if (initial) {

            if (initial.start)
                this.start = XmlNode.encodeValue(initial.start);

            if (initial.end)
                this.end = XmlNode.encodeValue(initial.end);

        }

        if (!this.start || !this.end)
            throw new Error('Both delimiters must be specified.');

        if (this.start === this.end)
            throw new Error('Start and end delimiters can not be the same.');
    }

}