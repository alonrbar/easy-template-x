export const ContentPartType = Object.freeze({
    MainDocument: 'MainDocument',
    DefaultHeader: 'DefaultHeader',
    FirstHeader: 'FirstHeader',
    EvenPagesHeader: 'EvenPagesHeader',
    DefaultFooter: 'DefaultFooter',
    FirstFooter: 'FirstFooter',
    EvenPagesFooter: 'EvenPagesFooter',
} as const);

export type ContentPartType = typeof ContentPartType[keyof typeof ContentPartType];
