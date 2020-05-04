export class Utils {
    static range(a, b, {
        step: c = 1,
        callback: d = null
    } = {}) {
        let e = [];
        for (let f = a; f <= b; f += c)
            if (d) {
                const a = d(f);
                a && e.push(a)
            } else e.push(f);
        return e
    }
    static isEqualArray(a, b) {
        if (a === b) return !0;
        if (null == a || null == b) return !1;
        const c = a.length;
        if (c != b.length) return !1;
        for (let d = 0; d < c; d++)
            if (a[d] !== b[d]) return !1;
        return !0
    }
    static isString(a) {
        return 'string' == typeof a || a instanceof String
    }
    static isTypedArray(a) {
        return !!a && a.buffer instanceof ArrayBuffer && a.BYTES_PER_ELEMENT
    }
    static isArrayOrTypedArray(a) {
        return Array.isArray(a) || Utils.isTypedArray(a)
    }
    static bytesToHexString(a, {
        offset: b = 0,
        size: c = null,
        separator: d = ' '
    } = {}) {
        let e = 0 >= c ? a.length : Math.min(a.length, b + c);
        const f = [];
        for (let g = b; g < e; g++) f.push(Utils.numToHexString(a[g]));
        return f.join(d)
    }
    static numToHexString(a, b = 2) {
        return a.toString(16).padStart(b, '0').toUpperCase()
    }
    static strToCharCodes(a, b = 0, c = ' ') {
        const d = c ? c.charCodeAt(0) : 0;
        b = b ? b : a.length;
        const e = Utils.range(1, b, {
            callback: () => d
        });
        b = Math.min(b, a.length);
        for (let d = 0; d < b; d++) e[d] = a.charCodeAt(d);
        return e
    }
    static decode7bitBytes(a) {
        let b = 0;
        for (let c of a) b <<= 7, b |= 127 & c;
        return b
    }
    static encode7bitBytes(a, b = 0) {
        if (0 >= b)
            for (b = 1; a >>> 7 * b && !(b >= 4);) b++;
        let c = Array(b);
        for (let d = 0; d < b; d++) c[b - d - 1] = 127 & a >>> 7 * d;
        return c
    }
    static wait(a, b = null) {
        return new Promise((b, c) => {
            try {
                setTimeout(() => {
                    try {
                        b()
                    } catch (a) {
                        c(a)
                    }
                }, a)
            } catch (a) {
                c(a)
            }
        }).then(() => {
            b && b()
        })
    }
    static calcCrc32(a, {
        offset: b = 0,
        length: c = 0,
        value: d = 0
    } = {}) {
        const e = (a) => a >>> 0;
        if (!Utils.CRC32_TABLE) {
            const a = Array(256);
            for (let b, c = 0; 256 > c; c++) {
                b = c;
                for (let a = 0; 8 > a; a++) 1 & b ? b = 3988292384 ^ b >>> 1 : b >>>= 1;
                a[c] = e(b)
            }
            Utils.CRC32_TABLE = a
        }(0 >= c || b + c > a.length) && (c = Math.max(0, a.length - b));
        const f = b + c;
        for (d = e(~d); b < f;) {
            const c = a[b];
            d = e(d >>> 8 ^ Utils.CRC32_TABLE[c ^ 255 & d]), b++
        }
        return d = e(~d), d
    }
}
