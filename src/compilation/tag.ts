import { IMap } from "src/types";
import { XmlTextNode } from "src/xml";

export const TagDisposition = Object.freeze({
    Open: "Open",
    Close: "Close",
    SelfClosed: "SelfClosed"
} as const);

export type TagDisposition = typeof TagDisposition[keyof typeof TagDisposition];

export interface Tag {
    name: string;
    options?: IMap<any>;
    /**
     * The full tag text, for instance: "{#my-tag}".
     */
    rawText: string;
    disposition: TagDisposition;
    xmlTextNode: XmlTextNode;
}
