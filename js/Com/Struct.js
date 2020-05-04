import {
    Utils
} from './Utils.js';
export const StructFieldType = {
    INT8: Symbol('INT8'),
    UINT8: Symbol('UINT8'),
    INT16: Symbol('INT16'),
    UINT16: Symbol('UINT16'),
    INT32: Symbol('INT32'),
    UINT32: Symbol('UINT32'),
    FLOAT32: Symbol('FLOAT32'),
    FLOAT64: Symbol('FLOAT64'),
    STRING: Symbol('STRING'),
    BIT7_INT16: Symbol('BIT7_INT16'),
    BIT7_UINT16: Symbol('BIT7_UINT16'),
    BIT7_INT32: Symbol('BIT7_INT32'),
    BIT7_UINT32: Symbol('BIT7_UINT32'),
    NIBBLE_INT8: Symbol('NIBBLE_INT8'),
    NIBBLE_UINT8: Symbol('NIBBLE_UINT8'),
    NIBBLE_INT16: Symbol('NIBBLE_INT16'),
    NIBBLE_UINT16: Symbol('NIBBLE_UINT16'),
    NIBBLE_INT32: Symbol('NIBBLE_INT32'),
    NIBBLE_UINT32: Symbol('NIBBLE_UINT32'),
    NIBBLE_STRING: Symbol('NIBBLE_STRING'),
    SKIP: Symbol('SKIP')
};
export class Struct {
    constructor(...a) {
        a.length && Utils.isString(a[0]) && (this.name = a.shift()), this._fields = a
    }
    get fields() {
        return this._fields
    }
    get size() {
        if (void 0 !== this._size) return this._size;
        let a = 0;
        for (const b of this._fields) {
            if (b instanceof Struct) {
                a += b.size;
                continue
            }
            const {
                type: c,
                length: d
            } = b;
            let e = Struct.fieldSize(c);
            1 < d && (e *= d), a += e
        }
        return this._size = a, a
    }
    static field(a, b, {
        length: c,
        value: d,
        verify: e,
        options: f
    } = {}) {
        const g = {
            name: a,
            type: b
        };
        return 0 < c && (g.length = c), void 0 !== d && (g.value = d), f && (g.options = f), g
    }
    static fieldSize(a) {
        let b = 0;
        return a === StructFieldType.STRING || a === StructFieldType.INT8 || a === StructFieldType.UINT8 || a === StructFieldType.SKIP ? b = 1 : a === StructFieldType.INT16 || a === StructFieldType.UINT16 || a === StructFieldType.BIT7_INT16 || a === StructFieldType.BIT7_UINT16 || a === StructFieldType.NIBBLE_INT8 || a === StructFieldType.NIBBLE_UINT8 || a === StructFieldType.NIBBLE_STRING ? b = 2 : a === StructFieldType.INT32 || a === StructFieldType.UINT32 || a === StructFieldType.FLOAT32 || a === StructFieldType.BIT7_INT32 || a === StructFieldType.BIT7_UINT32 || a === StructFieldType.NIBBLE_INT16 || a === StructFieldType.NIBBLE_UINT16 ? b = 4 : a === StructFieldType.FLOAT64 || a === StructFieldType.NIBBLE_INT32 || a === StructFieldType.NIBBLE_UINT32 ? b = 8 : void 0, b
    }
}
