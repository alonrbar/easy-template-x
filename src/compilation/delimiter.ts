import { XmlTextNode } from "../xmlNode";

export class Delimiter {

    public xmlTextNode: XmlTextNode;
    /**
     * Index inside the text node
     */
    public index: number;
    public isOpen: boolean;

    constructor(initial?: Partial<Delimiter>) {
        Object.assign(this, initial);
    }
}