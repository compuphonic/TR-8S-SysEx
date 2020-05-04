import {
    Caster
} from './Caster.js';
import {
    Struct,
    StructFieldType
} from './Struct.js';
import {
    Utils
} from './Utils.js';
export class DataReader {
    constructor(a = null, b = 0, c = void 0, d = !0) {
        this.setData(a, b, c, d)
    }
    setData(a, b = 0, c = void 0, d = !0) {
        this._data = a ? new DataView(a, b, c) : null, this._position = 0, this._littleEndian = d
    }
    get buffer() {
        return this._data ? this._data.buffer : null
    }
    get length() {
        return this._data ? this._data.byteLength : 0
    }
    get offset() {
        return this._data ? this._data.byteOffset : 0
    }
    get position() {
        return this._position
    }
    setPosition(a, b = !1) {
        return b && (a += this.position), this._position = Math.min(Math.max(0, a), this.length), this
    }
    canRead(a = 1) {
        return this._position + a <= this.length
    }
    remainingLength(a = StructFieldType.UINT8) {
        const b = Struct.fieldSize(a);
        return Math.max(0, Math.floor((this.length - this._position) / b))
    }
    readString(a, b = {}) {
        let c = new Uint8Array(this.buffer, this.offset + this._position, a);
        for (const d in c)
            if (0 === c[d]) {
                c = c.subarray(0, d);
                break
            } let d = String.fromCharCode(...c);
        return b.trim && (d = d.trim()), this._position += a, d
    }
    readInt8(a = 1, b = {}) {
        let c = null;
        return 1 < a || b.array ? (c = new Int8Array(this.buffer, this.offset + this._position, a), this._position += a) : (c = this._data.getInt8(this._position), this._position += 1), c
    }
    readUint8(a = 1, b = {}) {
        let c = null;
        return 1 < a || b.array ? (c = new Uint8Array(this.buffer, this.offset + this._position, a), this._position += a) : (c = this._data.getUint8(this._position), this._position += 1), c
    }
    readInt16(a = 1, b = {}) {
        const c = 'littleEndian' in b ? b.littleEndian : this._littleEndian;
        let d = null;
        if (1 < a || b.array) {
            d = new Int16Array(a);
            for (let b = 0; b < a; b++) d[b] = this._data.getInt16(this._position, c), this._position += 2
        } else d = this._data.getInt16(this._position, c), this._position += 2;
        return d
    }
    readUint16(a = 1, b = {}) {
        const c = 'littleEndian' in b ? b.littleEndian : this._littleEndian;
        let d = null;
        if (1 < a || b.array) {
            d = new Uint16Array(a);
            for (let b = 0; b < a; b++) d[b] = this._data.getUint16(this._position, c), this._position += 2
        } else d = this._data.getUint16(this._position, c), this._position += 2;
        return d
    }
    readInt32(a = 1, b = {}) {
        const c = 'littleEndian' in b ? b.littleEndian : this._littleEndian;
        let d = null;
        if (1 < a || b.array) {
            d = new Int32Array(a);
            for (let b = 0; b < a; b++) d[b] = this._data.getInt32(this._position, c), this._position += 4
        } else d = this._data.getInt32(this._position, c), this._position += 4;
        return d
    }
    readUint32(a = 1, b = {}) {
        const c = 'littleEndian' in b ? b.littleEndian : this._littleEndian;
        let d = null;
        if (1 < a || b.array) {
            d = new Uint32Array(a);
            for (let b = 0; b < a; b++) d[b] = this._data.getUint32(this._position, c), this._position += 4
        } else d = this._data.getUint32(this._position, c), this._position += 4;
        return d
    }
    readFloat32(a = 1, b = {}) {
        const c = 'littleEndian' in b ? b.littleEndian : this._littleEndian;
        let d = null;
        if (1 < a || b.array) {
            d = new Float32Array(a);
            for (let b = 0; b < a; b++) d[b] = this._data.getFloat32(this._position, c), this._position += 4
        } else d = this._data.getFloat32(this._position, c), this._position += 4;
        return d
    }
    readFloat64(a = 1, b = {}) {
        const c = 'littleEndian' in b ? b.littleEndian : this._littleEndian;
        let d = null;
        if (1 < a || b.array) {
            d = new Float64Array(a);
            for (let b = 0; b < a; b++) d[b] = this._data.getFloat64(this._position, c), this._position += 8
        } else d = this._data.getFloat64(this._position, c), this._position += 8;
        return d
    }
    read7bitBytesInt16(a = 1, b = {}) {
        let c = null;
        if (1 < a || b.array) {
            c = new Int16Array(a);
            for (let b = 0; b < a; b++) c[b] = Caster.toInt16(Utils.decode7bitBytes(this.readUint8(2)))
        } else c = Caster.toInt16(Utils.decode7bitBytes(this.readUint8(2)));
        return c
    }
    read7bitBytesUint16(a = 1, b = {}) {
        let c = null;
        if (1 < a || b.array) {
            c = new Uint16Array(a);
            for (let b = 0; b < a; b++) c[b] = Utils.decode7bitBytes(this.readUint8(2))
        } else c = Utils.decode7bitBytes(this.readUint8(2));
        return c
    }
    read7bitBytesInt32(a = 1, b = {}) {
        let c = null;
        if (1 < a || b.array) {
            c = new Int32Array(a);
            for (let b = 0; b < a; b++) c[b] = Caster.toInt32(Utils.decode7bitBytes(this.readUint8(4)))
        } else c = Caster.toInt32(Utils.decode7bitBytes(this.readUint8(4)));
        return c
    }
    read7bitBytesUint32(a = 1, b = {}) {
        let c = null;
        if (1 < a || b.array) {
            c = new Uint32Array(a);
            for (let b = 0; b < a; b++) c[b] = Utils.decode7bitBytes(this.readUint8(4))
        } else c = Utils.decode7bitBytes(this.readUint8(4));
        return c
    }
    readNibbledInt8(a = 1, b = {}) {
        let c = null;
        if (1 < a || b.array) {
            c = new Int8Array(a);
            for (let b = 0; b < a; b++) c[b] = Caster.toInt8(this._readNibbledUint(2))
        } else c = Caster.toInt8(this._readNibbledUint(2));
        return c
    }
    readNibbledUint8(a = 1, b = {}) {
        let c = null;
        if (1 < a || b.array) {
            c = new Uint8Array(a);
            for (let b = 0; b < a; b++) c[b] = this._readNibbledUint(2)
        } else c = this._readNibbledUint(2);
        return c
    }
    readNibbledUint16(a = 1, b = {}) {
        let c = null;
        if (1 < a || b.array) {
            c = new Int16Array(a);
            for (let b = 0; b < a; b++) c[b] = Caster.toInt16(this._readNibbledUint(4))
        } else c = Caster.toInt16(this._readNibbledUint(4));
        return c
    }
    readNibbledUint16(a = 1, b = {}) {
        let c = null;
        if (1 < a || b.array) {
            c = new Uint16Array(a);
            for (let b = 0; b < a; b++) c[b] = this._readNibbledUint(4)
        } else c = this._readNibbledUint(4);
        return c
    }
    readNibbledInt32(a = 1, b = {}) {
        let c = null;
        if (1 < a || b.array) {
            c = new Int32Array(a);
            for (let b = 0; b < a; b++) c[b] = Caster.toInt32(this._readNibbledUint(8))
        } else c = Caster.toInt32(this._readNibbledUint(8));
        return c
    }
    readNibbledUint32(a = 1, b = {}) {
        let c = null;
        if (1 < a || b.array) {
            c = new Uint32Array(a);
            for (let b = 0; b < a; b++) c[b] = this._readNibbledUint(8)
        } else c = this._readNibbledUint(8);
        return c
    }
    readNibbledString(a, b = {}) {
        let c = new Uint8Array(a);
        for (let d = 0; d < a; d++) c[d] = this._readNibbledUint(2);
        for (const d in c)
            if (0 === c[d]) {
                c = c.subarray(0, d);
                break
            } let d = String.fromCharCode(...c);
        return b.trim && (d = d.trim()), d
    }
    _readNibbledUint(a) {
        let b = 0;
        for (let c = 0; c < a; c++) b <<= 4, b |= 15 & this._data.getUint8(this._position), this._position += 1;
        return b
    }
    readStruct(a) {
        const b = {};
        for (const c of a.fields) {
            const a = c instanceof Struct ? this.readStruct(c) : this.readField(c);
            null !== a && (b[c.name] = a)
        }
        return b
    }
    readField(a) {
        const {
            name: b,
            type: c
        } = a, d = a.length || 1, e = this.readFieldType(c, d, a.options);
        if (a.value) switch (c) {
            case StructFieldType.SKIP:
                break;
            case StructFieldType.STRING:
                if (e != a.value) throw new Error(`Invalid struct field "${b}" value of "${e}".`);
                break;
            default:
                if (1 < d) {
                    if (!Utils.isEqualArray(e, a.value)) throw new Error(`Invalid struct field "${b}" value of ${e}.`);
                } else if (e != a.value) throw new Error(`Invalid struct field "${b}" value of ${e}.`);
        }
        if (a.verify && !a.verify(a, e)) throw new Error(`Invalid struct field "${b}" value of ${e}.`);
        return e
    }
    readFieldType(a, b = 1, c = {}) {
        let d = null;
        switch (c = c || {}, a) {
            case StructFieldType.STRING:
                d = this.readString(b, c);
                break;
            case StructFieldType.INT8:
                d = this.readInt8(b, c);
                break;
            case StructFieldType.UINT8:
                d = this.readUint8(b, c);
                break;
            case StructFieldType.INT16:
                d = this.readInt16(b, c);
                break;
            case StructFieldType.UINT16:
                d = this.readUint16(b, c);
                break;
            case StructFieldType.INT32:
                d = this.readInt32(b, c);
                break;
            case StructFieldType.UINT32:
                d = this.readUint32(b, c);
                break;
            case StructFieldType.FLOAT32:
                d = this.readFloat32(b, c);
                break;
            case StructFieldType.FLOAT64:
                d = this.readFloat64(b, c);
                break;
            case StructFieldType.BIT7_INT16:
                d = this.read7bitBytesInt16(b, c);
                break;
            case StructFieldType.BIT7_UINT16:
                d = this.read7bitBytesUint16(b, c);
                break;
            case StructFieldType.BIT7_INT32:
                d = this.read7bitBytesInt32(b, c);
                break;
            case StructFieldType.BIT7_UINT32:
                d = this.read7bitBytesUint32(b, c);
                break;
            case StructFieldType.NIBBLE_INT8:
                d = this.readNibbledInt8(b, c);
                break;
            case StructFieldType.NIBBLE_UINT8:
                d = this.readNibbledUint8(b, c);
                break;
            case StructFieldType.NIBBLE_INT16:
                d = this.readNibbledInt16(b, c);
                break;
            case StructFieldType.NIBBLE_UINT16:
                d = this.readNibbledUint16(b, c);
                break;
            case StructFieldType.NIBBLE_INT32:
                d = this.readNibbledInt32(b, c);
                break;
            case StructFieldType.NIBBLE_UINT32:
                d = this.readNibbledUint32(b, c);
                break;
            case StructFieldType.NIBBLE_STRING:
                d = this.readNibbledString(b, c);
                break;
            case StructFieldType.SKIP:
                this._position += b;
                break;
            default:
                throw new Error(`Invalid struct field type ${a}.`);
        }
        return d
    }
    calcCrc32(a) {
        return Utils.calcCrc32(new Uint8Array(this.buffer, this.offset), this.position, a)
    }
    static fromTypedArray(a, b = !0) {
        return new DataReader(a.buffer, a.byteOffset, a.byteLength, b)
    }
}
