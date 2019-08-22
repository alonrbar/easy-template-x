export interface Relationship {
    id: string;
    type: string;
    target: string;
}

export class Relationship {
    
    public static fromXml(xml: any): Relationship {
        return {
            id: null,
            type: null,
            target: null
        };
    }

    public static toXml(rel: Relationship): any {
        return null;
    }
}