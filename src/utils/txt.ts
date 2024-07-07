
// Copied from: https://gist.github.com/thanpolas/244d9a13151caf5a12e42208b6111aa6
// And see: https://unicode-table.com/en/sets/quotation-marks/
const nonStandardDoubleQuotes = [
    '“', // U+201c
    '”', // U+201d
    '«', // U+00AB
    '»', // U+00BB
    '„', // U+201E
    '“', // U+201C
    '‟', // U+201F
    '”', // U+201D
    '❝', // U+275D
    '❞', // U+275E
    '〝', // U+301D
    '〞', // U+301E
    '〟', // U+301F
    '＂', // U+FF02
];

const standardDoubleQuotes = '"'; // U+0022

const nonStandardDoubleQuotesRegex = new RegExp(nonStandardDoubleQuotes.join('|'), 'g');

export function stringValue(val: unknown): string {
    if (val === null || val === undefined) {
        return '';
    }
    return val.toString();
}

export function normalizeDoubleQuotes(text: string): string {
    return text.replace(nonStandardDoubleQuotesRegex, standardDoubleQuotes);
}
