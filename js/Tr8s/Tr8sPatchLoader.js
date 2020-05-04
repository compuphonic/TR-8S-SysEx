import {
    DEBUG
} from '../Com/Debug.js';
import {
    DataReader
} from '../Com/DataReader.js';
import {
    FileReader
} from '../Com/FileReader.js';
import {
    Struct,
    StructFieldType as SFType
} from '../Com/Struct.js';
import {
    Utils
} from '../Com/Utils.js';
import {
    ErrorCode
} from './Tr8sErrorCode.js';
import {
    Tr8sDeviceController,
    TR8S_CONFIG
} from './Tr8sDeviceController.js';
const T8P_HEADER_ID = 'T8P ',
    T8K_HEADER_ID = 'T8K ',
    NAME_HEADER_ID = 'NAME',
    PTN_HEADER_ID = 'PTN ',
    KIT_HEADER_ID = 'KIT ',
    TONE_HEADER_ID = 'TONE',
    PCMT_HEADER_ID = 'PCMT',
    WAVE_HEADER_ID = 'WAVE',
    SMPL_HEADER_ID = 'SMPL',
    FILE_HEADER_STRUCT = new Struct(Struct.field('format', SFType.UINT32), Struct.field('headerCount', SFType.UINT32), Struct.field('reserved1', SFType.SKIP, {
        length: 4
    }), Struct.field('name', SFType.STRING, {
        length: 16
    }), Struct.field('uid', SFType.UINT32, {
        length: 3
    }), Struct.field('reserved2', SFType.SKIP, {
        length: 4
    }), Struct.field('reserved3', SFType.SKIP, {
        length: 4
    }), Struct.field('reserved4', SFType.SKIP, {
        length: 4
    }), Struct.field('headersSum', SFType.UINT32), Struct.field('headerSum', SFType.UINT32)),
    BLOCK_HEADER_STRUCT = new Struct(Struct.field('version', SFType.UINT32), Struct.field('dataSize', SFType.UINT32), Struct.field('reserved1', SFType.SKIP, {
        length: 4
    }), Struct.field('dataCount', SFType.UINT32), Struct.field('data1Size', SFType.UINT32), Struct.field('dataSum', SFType.UINT32), Struct.field('headerSum', SFType.UINT32)),
    SMPL_HEADER_STRUCT = new Struct(Struct.field('dataSize', SFType.UINT32), Struct.field('dataSum', SFType.UINT32), Struct.field('headerSum', SFType.UINT32)),
    NAME_DATA_STRUCT = new Struct(Struct.field('patchName', SFType.STRING, {
        length: 16,
        options: {
            trim: !0
        }
    }));
export class Tr8sPatchLoader {
    constructor() {
        this._headers = {}, this._data = {}, this._patches = [], this._headers[SMPL_HEADER_ID] = [], this._data[SMPL_HEADER_ID] = []
    }
    _readFileHeader(a, b) {
        const c = b.readStruct(FILE_HEADER_STRUCT);
        this._headers[a] = c
    }
    _readDataBlock(a, b, c = null) {
        const d = b.readStruct(BLOCK_HEADER_STRUCT);
        if (this._headers[a] = d, c && 0 < d.dataCount) {
            this._data[a] = [];
            for (let b = 0; b < d.dataCount; b++) {
                const e = c(d, b);
                e && this._data[a].push(e)
            }
        }
    }
    _readSampleDataBlock(a) {
        const b = a.readStruct(SMPL_HEADER_STRUCT),
            c = a.readUint8(b.dataSize);
        this._headers[SMPL_HEADER_ID].push(b), this._data[SMPL_HEADER_ID].push(c)
    }
    _readParams(a, b) {
        const c = DataReader.fromTypedArray(a),
            d = {};
        for (const e of b)
            if (0 < e.count) {
                d[e.name] = [];
                for (let a = 0; a < e.count; a++) c.setPosition(e.offset + a * e.step), d[e.name].push(c.readFieldType(e.type, e.length, e.options))
            } else c.setPosition(e.offset), d[e.name] = c.readFieldType(e.type, e.length, e.options);
        return d
    }
    _compilePatch() {
        const a = {
                ptns: this._data[PTN_HEADER_ID] || [],
                kits: this._data[KIT_HEADER_ID] || [],
                tones: this._data[TONE_HEADER_ID] || [],
                pcmts: this._data[PCMT_HEADER_ID] || [],
                smpls: this._data[SMPL_HEADER_ID] || []
            },
            b = new Set;
        for (const c of a.kits)
            for (const a of c.toneIds) a >= TR8S_CONFIG.minToneId && b.add(a);
        const c = new Map;
        for (const d of Array.from(b).sort()) {
            const b = c.size,
                e = {
                    toneId: d
                };
            if (b < a.tones.length) {
                const c = a.tones[b];
                e.tone = {
                    data: c.data
                }
            }
            if (b < a.pcmts.length) {
                const c = a.pcmts[b];
                e.pcmTone = {
                    channel: c.channel,
                    size: c.size,
                    data: c.data
                }
            }
            if (b < a.smpls.length) {
                const c = a.smpls[b],
                    d = Tr8sDeviceController.calcSampleSectorSize(c.length);
                e.sample = {
                    data: c,
                    size: d,
                    sizeRatio: Tr8sDeviceController.calcSampleSizeRatio(d)
                }
            }
            c.set(d, e)
        }
        const d = [];
        for (const e of a.kits) {
            const a = {
                kit: {
                    name: e.name,
                    data: e.data
                },
                toneIds: [],
                userTones: [],
                sampleSize: 0,
                sampleSizeRatio: 0
            };
            b.clear();
            for (const c of e.toneIds) c >= TR8S_CONFIG.minToneId && b.add(c), a.toneIds.push(c);
            for (const d of Array.from(b).sort()) {
                const b = c.get(d);
                a.userTones.push(b), a.sampleSize += b.sample.size
            }
            a.sampleSizeRatio = Tr8sDeviceController.calcSampleSizeRatio(a.sampleSize), d.push(a)
        }
        if (!a.ptns) return d;
        const e = [];
        for (const b of a.ptns) {
            const a = {
                pattern: {
                    name: b.name,
                    data: b.data
                },
                sampleSize: 0,
                sampleSizeRatio: 0
            };
            b.isKitEnabled && b.kitId < d.length ? e.push(Object.assign(a, d[b.kitId])) : e.push(a)
        }
        return e
    }
    parse(a) {
        return new Promise((b, c) => {
            const d = new FileReader;
            d.load(a).then(() => {
                try {
                    for (; d.canRead();) {
                        const b = d.readString(4);
                        switch (b) {
                            case T8P_HEADER_ID:
                            case T8K_HEADER_ID:
                                this._readFileHeader(b, d);
                                break;
                            case NAME_HEADER_ID:
                                this._readDataBlock(b, d, () => {
                                    return d.readStruct(NAME_DATA_STRUCT)
                                });
                                break;
                            case PTN_HEADER_ID:
                                this._readDataBlock(b, d, (a) => {
                                    const b = d.readUint8(a.data1Size),
                                        c = this._readParams(b, [{
                                            name: 'name',
                                            offset: 0,
                                            type: SFType.STRING,
                                            length: 16,
                                            options: {
                                                trim: !0
                                            }
                                        }, {
                                            name: 'kitId',
                                            offset: 18,
                                            type: SFType.UINT8
                                        }, {
                                            name: 'isKitEnabled',
                                            offset: 114,
                                            type: SFType.UINT8
                                        }]);
                                    return 0 < c.kitId && c.kitId--, Object.assign({
                                        data: b
                                    }, c)
                                });
                                break;
                            case KIT_HEADER_ID:
                                this._readDataBlock(b, d, (a) => {
                                    const b = d.readUint8(a.data1Size),
                                        c = this._readParams(b, [{
                                            name: 'name',
                                            offset: 0,
                                            type: SFType.STRING,
                                            length: 16,
                                            options: {
                                                trim: !0
                                            }
                                        }, {
                                            name: 'toneIds',
                                            offset: 388,
                                            step: 52,
                                            count: 11,
                                            type: SFType.UINT16
                                        }]);
                                    return Object.assign({
                                        data: b
                                    }, c)
                                });
                                break;
                            case TONE_HEADER_ID:
                                this._readDataBlock(b, d, (a) => {
                                    const b = d.readUint8(a.data1Size);
                                    return {
                                        data: b
                                    }
                                });
                                break;
                            case PCMT_HEADER_ID:
                                this._readDataBlock(b, d, (a) => {
                                    const b = d.readUint8(a.data1Size),
                                        c = this._readParams(b, [{
                                            name: 'address',
                                            offset: 0,
                                            type: SFType.UINT32
                                        }, {
                                            name: 'addressRight',
                                            offset: 4,
                                            type: SFType.UINT32
                                        }, {
                                            name: 'channel',
                                            offset: 28,
                                            type: SFType.UINT8
                                        }, {
                                            name: 'size',
                                            offset: 8,
                                            type: SFType.UINT32
                                        }]);
                                    return Object.assign({
                                        data: b
                                    }, c)
                                });
                                break;
                            case WAVE_HEADER_ID:
                                this._readDataBlock(b, d);
                                break;
                            case SMPL_HEADER_ID:
                                this._readSampleDataBlock(d);
                                break;
                            default:
                                throw new Error(`Invalid format: "${a}".`);
                        }
                    }
                } catch (a) {
                    return DEBUG.console.error(a), void c(ErrorCode.PatchFileReadError)
                }
                this._patches = this._compilePatch(), DEBUG.console.log('headers', this._headers), DEBUG.console.log('data', this._data), DEBUG.console.log('patches', this._patches), b(this._patches)
            }).catch(() => {
                c(ErrorCode.PatchFileReadError)
            })
        })
    }
}
