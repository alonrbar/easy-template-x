import { XmlTextNode } from "../xml";

export class DelimiterMark {

    public xmlTextNode: XmlTextNode;
    /**
     * Index inside the text node
     */
    public index: number;
    /**
     * Is this an open delimiter or a close delimiter
     */
    public isOpen: boolean;

    constructor(initial?: Partial<DelimiterMark>) {
        Object.assign(this, initial);
    }
}