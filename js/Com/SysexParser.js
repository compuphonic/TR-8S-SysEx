import {
    DataReader
} from './DataReader.js';
import {
    DEBUG
} from './Debug.js';
import {
    Struct,
    StructFieldType as SFType
} from './Struct.js';
const DEFAULT_SYSEX_FOOTER_STRUCT = new Struct(Struct.field('checksum', SFType.UINT8), Struct.field('EOX', SFType.UINT8, {
    value: 247
}));
export class SysexParser {
    constructor(a, b = DEFAULT_SYSEX_FOOTER_STRUCT) {
        this._headerStruct = a, this._footerStruct = b, this._header = null, this._footer = null, this._data = null
    }
    get header() {
        return this._header
    }
    get footer() {
        return this._footer
    }
    get data() {
        return this._data
    }
    dataReader(a = !0) {
        return this._data ? DataReader.fromTypedArray(this._data, a) : null
    }
    parse(a, b = !0) {
        this._header = null, this._footer = null, this._data = null;
        try {
            const c = DataReader.fromTypedArray(a, b),
                d = c.length - (this._headerStruct.size + this._footerStruct.size);
            if (0 > d) throw new Error(`Invalid sysex message.`);
            this._header = c.readStruct(this._headerStruct), this._data = d ? c.readUint8(d, {
                array: !0
            }) : new Uint8Array(0), this._footer = c.readStruct(this._footerStruct)
        } catch (a) {
            return DEBUG.console.error(a), !1
        }
        return !0
    }
}
