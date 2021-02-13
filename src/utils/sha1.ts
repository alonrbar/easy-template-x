/**
 * Secure Hash Algorithm (SHA1)
 *
 * Taken from here: http://www.webtoolkit.info/javascript-sha1.html
 *
 * Recommended here: https://stackoverflow.com/questions/6122571/simple-non-secure-hash-function-for-javascript#6122732
 */
export function sha1(msg: string): string {

    msg = utf8Encode(msg);
    const msgLength = msg.length;

    let i, j;

    const wordArray = [];
    for (i = 0; i < msgLength - 3; i += 4) {
        j = msg.charCodeAt(i) << 24 | msg.charCodeAt(i + 1) << 16 |
            msg.charCodeAt(i + 2) << 8 | msg.charCodeAt(i + 3);
        wordArray.push(j);
    }

    switch (msgLength % 4) {
        case 0:
            i = 0x080000000;
            break;
        case 1:
            i = msg.charCodeAt(msgLength - 1) << 24 | 0x0800000;
            break;
        case 2:
            i = msg.charCodeAt(msgLength - 2) << 24 | msg.charCodeAt(msgLength - 1) << 16 | 0x08000;
            break;
        case 3:
            i = msg.charCodeAt(msgLength - 3) << 24 | msg.charCodeAt(msgLength - 2) << 16 | msg.charCodeAt(msgLength - 1) << 8 | 0x80;
            break;
    }
    wordArray.push(i);

    while ((wordArray.length % 16) != 14) {
        wordArray.push(0);
    }

    wordArray.push(msgLength >>> 29);
    wordArray.push((msgLength << 3) & 0x0ffffffff);

    const w = new Array(80);
    let H0 = 0x67452301;
    let H1 = 0xEFCDAB89;
    let H2 = 0x98BADCFE;
    let H3 = 0x10325476;
    let H4 = 0xC3D2E1F0;
    let A, B, C, D, E;
    let temp;
    for (let blockStart = 0; blockStart < wordArray.length; blockStart += 16) {

        for (i = 0; i < 16; i++) {
            w[i] = wordArray[blockStart + i];
        }
        for (i = 16; i <= 79; i++) {
            w[i] = rotateLeft(w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16], 1);
        }
        A = H0;
        B = H1;
        C = H2;
        D = H3;
        E = H4;
        for (i = 0; i <= 19; i++) {
            temp = (rotateLeft(A, 5) + ((B & C) | (~B & D)) + E + w[i] + 0x5A827999) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotateLeft(B, 30);
            B = A;
            A = temp;
        }
        for (i = 20; i <= 39; i++) {
            temp = (rotateLeft(A, 5) + (B ^ C ^ D) + E + w[i] + 0x6ED9EBA1) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotateLeft(B, 30);
            B = A;
            A = temp;
        }
        for (i = 40; i <= 59; i++) {
            temp = (rotateLeft(A, 5) + ((B & C) | (B & D) | (C & D)) + E + w[i] + 0x8F1BBCDC) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotateLeft(B, 30);
            B = A;
            A = temp;
        }
        for (i = 60; i <= 79; i++) {
            temp = (rotateLeft(A, 5) + (B ^ C ^ D) + E + w[i] + 0xCA62C1D6) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotateLeft(B, 30);
            B = A;
            A = temp;
        }
        H0 = (H0 + A) & 0x0ffffffff;
        H1 = (H1 + B) & 0x0ffffffff;
        H2 = (H2 + C) & 0x0ffffffff;
        H3 = (H3 + D) & 0x0ffffffff;
        H4 = (H4 + E) & 0x0ffffffff;
    }
    temp = cvtHex(H0) + cvtHex(H1) + cvtHex(H2) + cvtHex(H3) + cvtHex(H4);
    return temp.toLowerCase();
}

function rotateLeft(n: any, s: any) {
    const t4 = (n << s) | (n >>> (32 - s));
    return t4;
}

function cvtHex(val: any) {
    let str = "";
    for (let i = 7; i >= 0; i--) {
        const v = (val >>> (i * 4)) & 0x0f;
        str += v.toString(16);
    }
    return str;
}

function utf8Encode(str: string) {
    str = str.replace(/\r\n/g, "\n");
    let utfStr = "";
    for (let n = 0; n < str.length; n++) {
        const c = str.charCodeAt(n);
        if (c < 128) {
            utfStr += String.fromCharCode(c);

        } else if ((c > 127) && (c < 2048)) {
            utfStr += String.fromCharCode((c >> 6) | 192);
            utfStr += String.fromCharCode((c & 63) | 128);

        } else {
            utfStr += String.fromCharCode((c >> 12) | 224);
            utfStr += String.fromCharCode(((c >> 6) & 63) | 128);
            utfStr += String.fromCharCode((c & 63) | 128);
        }
    }
    return utfStr;
}
