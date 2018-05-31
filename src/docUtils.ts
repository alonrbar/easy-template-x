
interface CharMapRegex {
    regStart: RegExp;
    regEnd: RegExp;
    start: string;
    end: string;
}

export class DocUtils {

    //
    // constants
    //

    private static readonly regexStripRegexp = /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g;

    private static readonly charMap = {
        "&": "&amp;",
        "'": "&apos;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;"
    };

    private static readonly charMapRegex: CharMapRegex[] =  DocUtils.initCharMapRegex();

    //
    // public methods
    //

    public static escapeRegExp(str: string) {
        return str.replace(DocUtils.regexStripRegexp, "\\$&");
    }

    public static wordToUtf8(str: string) {
        let r;
        for (let i = 0, l = DocUtils.charMapRegex.length; i < l; i++) {
            r = DocUtils.charMapRegex[i];
            str = str.replace(r.regStart, r.end);
        }
        return str;
    }

    public static utf8ToWord(str: string) {
        if (typeof str !== "string") {
            str = (str as any).toString();
        }

        let r;
        for (let i = 0, l = DocUtils.charMapRegex.length; i < l; i++) {
            r = DocUtils.charMapRegex[i];
            str = str.replace(r.regEnd, r.start);
        }
        return str;
    }

    //
    // private methods
    //

    private static initCharMapRegex(): CharMapRegex[] {
        return Object.keys(DocUtils.charMap).map(endChar => {
            const startChar = (DocUtils.charMap as any)[endChar];
            return {
                regStart: new RegExp(DocUtils.escapeRegExp(startChar), "g"),
                regEnd: new RegExp(DocUtils.escapeRegExp(endChar), "g"),
                start: startChar,
                end: endChar
            };
        });
    }    
}