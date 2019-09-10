import { XmlNode } from '../xml';

export interface ContentTypeDeclaration {
    declarationType: string;
    contentType: string;
}

export class ContentTypeDeclaration {

    public static fromXml(xml: any): ContentTypeDeclaration {
        // return {
        //     id: null,
        //     type: null,
        //     target: null
        // };

        return null;
    }

    public static toXml(rel: ContentTypeDeclaration): XmlNode {
        return null;
    }
}