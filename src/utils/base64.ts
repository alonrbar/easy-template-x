export class Base64 {

    public static encode(str: string): string {
        
        // browser
        if (typeof btoa !== 'undefined') 
            return btoa(str);

        // node
        // https://stackoverflow.com/questions/23097928/node-js-btoa-is-not-defined-error#38446960
        return new Buffer(str, 'binary').toString('base64');
    }
}