import { TemplateContent, TemplateData } from '../templateData';
export declare class ScopeData {
    readonly path: (string | number)[];
    readonly allData: TemplateData;
    constructor(data: TemplateData);
    getScopeData(): TemplateContent | TemplateData[];
}
