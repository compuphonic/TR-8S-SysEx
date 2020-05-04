import {
    DEBUG
} from '../Com/Debug.js';
import {
    FileReader
} from '../Com/FileReader.js';
import {
    MidiManager
} from '../Com/MidiManager.js';
import {
    MidiDeviceController
} from '../Com/MidiDeviceController.js';
import {
    Struct,
    StructFieldType as SFType
} from '../Com/Struct.js';
import {
    SysexParser
} from '../Com/SysexParser.js';
import {
    Utils
} from '../Com/Utils.js';
import {
    ErrorCode
} from './Tr8sErrorCode.js';
import {
    Tr8sAsyncStatus,
    Tr8sAsyncStatusContext
} from './Tr8sAsyncStatus.js';
import {
    TR8S_DATA
} from './Tr8sData.js';
DEBUG.SKIP_SEND_PATCH_SAMPLE = !1, DEBUG.SKIP_SEND_PATCH_WRITE = !1;
export const TR8S_CONFIG = eval(`(${atob(TR8S_DATA)})`);
const SYSTEM_LOCK_WAIT = 500,
    NEXT_SYSEX_SEND_WAIT = 64,
    OPTIMIZE_PROGRESS_TIMEOUT = 30000,
    DEFAULT_BACKUP_FILENAME = 'tr8s_bak.bin',
    DEFAULT_DATA_TRANSFER_WAIT = 50;
export class Tr8sDeviceController extends MidiDeviceController {
    constructor(a, b = 16) {
        super(a, [0, 0, 0, 69], b), this._isSystemLocked = !1
    }
    static calcSampleSizeRatio(a) {
        return Math.round(1e4 * (a / TR8S_CONFIG.storageSize)) / 100
    }
    static calcSampleSectorSize(a) {
        return -131072 & a + 131071
    }
    get deviceStatus() {
        return this._deviceStatus || {}
    }
    get isDeviceVersionSupported() {
        const a = this.deviceStatus.version;
        return !!a && (1 < a.major || 1 == a.major && 11 <= a.minor)
    }
    updateDeviceStatus(a = null, b = {}) {
        const c = TR8S_CONFIG.temp.sys.categoryName.dataCount,
            d = b.excludes || [],
            e = this._deviceStatus || {},
            f = {};
        if (this._deviceStatus = {}, a) {
            const b = {
                version: 1,
                uid: 1,
                categoryNames: c,
                storage: 1,
                patterns: 128,
                kits: 128,
                tones: 400
            };
            let f = 1;
            for (const a of Object.keys(b)) e[a] && d.includes(a) || (f += b[a]);
            a.setTaskContext(Tr8sAsyncStatusContext.UPDATING_DEVICE_STATUS), a.resetTaskProgressRange(0, f)
        }
        return super.updateDeviceStatus().then(() => {
            return e.version && d.includes('version') ? (this._deviceStatus.version = e.version, void(f.version = e.version)) : this._requestUtilityCommand('version', null, (b) => {
                const c = b.readString(4),
                    d = b.readString(4),
                    e = c.split('.'),
                    g = {
                        major: 0 < e.length ? parseInt(e[0], 10) : null,
                        minor: 1 < e.length ? parseInt(e[1], 10) : null,
                        text: c,
                        revision: d
                    };
                if (this._deviceStatus.version = g, f.version = g, !this.isDeviceVersionSupported) throw ErrorCode.Tr8sVersionNotSupportedError;
                return a && a.incTaskProgress(), f.version
            }, {
                timeoutCallback: () => {
                    throw ErrorCode.Tr8sVersionNotSupportedError
                }
            })
        }).then(() => {
            return e.uid && d.includes('uid') ? void(f.uid = e.uid) : this._requestUtilityCommand('uid', null, (b) => {
                const c = b.readNibbledUint32(3);
                return f.uid = c, a && a.incTaskProgress(), f.uid
            })
        }).then(() => {
            return e.storage && d.includes('storage') ? void(f.storage = e.storage) : this._requestStorageInfo((b) => {
                f.storage = b, a && a.incTaskProgress()
            })
        }).then(() => {
            if (e.categoryNames && d.includes('categoryNames')) return void(f.categoryNames = e.categoryNames);
            const b = TR8S_CONFIG.presetCategory.length;
            return f.categoryNames = TR8S_CONFIG.presetCategory.concat(Array(c)), this._requestCategoryNames((c, d) => {
                f.categoryNames[b + c] = d, a && a.incTaskProgress()
            })
        }).then(() => {
            return e.patterns && d.includes('patterns') ? void(f.patterns = e.patterns) : (f.patterns = Utils.range(TR8S_CONFIG.minPatternId, TR8S_CONFIG.maxPatternId, {
                callback: (a) => {
                    return {
                        id: a
                    }
                }
            }), this._requestPatterns((b) => {
                f.patterns[b.id] = b, a && a.incTaskProgress()
            }))
        }).then(() => {
            return e.kits && d.includes('kits') ? void(f.kits = e.kits) : (f.kits = Utils.range(TR8S_CONFIG.minKitId, TR8S_CONFIG.maxKitId, {
                callback: (a) => {
                    return {
                        id: a
                    }
                }
            }), this._requestKits((b) => {
                f.kits[b.id] = b, a && a.incTaskProgress()
            }))
        }).then(() => {
            return e.tones && d.includes('tones') ? void(f.tones = e.tones) : (f.tones = Utils.range(TR8S_CONFIG.minToneId, TR8S_CONFIG.maxToneId, {
                callback: (a) => {
                    return {
                        id: a
                    }
                }
            }), this._requestTones((b) => {
                f.tones[b.id - TR8S_CONFIG.minToneId] = b, a && a.incTaskProgress()
            }))
        }).then(() => {
            this._resolveDataReferences(f), f.isValid = !0, this._deviceStatus = f, a && a.finishTask(), DEBUG.console.log('device status', this._deviceStatus)
        })
    }
    sendPatch(a, b, c, d = null) {
        return new Promise((e, f) => {
            const g = a.kit && this._isValidKitId(c),
                h = a.pattern && this._isValidPatternId(b),
                i = (a.userTones || []).length;
            if (d) {
                let a = 2;
                g && (a += 4 * i + 3), h && (a += 2), d.resetSubtaskCount(a), d.resetTaskProgressRange()
            }
            return Promise.resolve().then(() => {
                if (!g) return;
                d && d.setTaskContext(Tr8sAsyncStatusContext.SENDING_KIT);
                const b = Array.from(a.toneIds, (a) => {
                    return a >= TR8S_CONFIG.minToneId ? a : null
                });
                let e = this._deviceStatus.storage.topFreeAddress,
                    f = Promise.resolve();
                for (const c of a.userTones || []) f = f.then(() => {
                    const a = e;
                    let f = c.toneId;
                    return e += c.sample.size, Promise.resolve().then(() => {
                        if (DEBUG.SKIP_SEND_PATCH_SAMPLE) return void d.finishSubtask();
                        const b = c.sample;
                        return this._sendDataTransfer('sample', [a, b.data.length], b.data, null, (a) => {
                            d && d.setTaskProgress(a), 100 === a && d && d.finishSubtask()
                        })
                    }).then(() => {
                        return this._requestUtilityCommand('freeTone', null, (a) => {
                            f = a.read7bitBytesUint16();
                            for (let d = 0; d < b.length; d++) b[d] === c.toneId && (b[d] = f);
                            return d && d.finishSubtask(), f
                        })
                    }).then(() => {
                        const a = c.tone;
                        return this._sendDataTransfer('tone', [f, 1], a.data, null, (a) => {
                            d && d.setTaskProgress(a), 100 === a && d && d.finishSubtask()
                        })
                    }).then(() => {
                        const b = c.pcmTone,
                            e = 1 < b.channel ? a + b.size : a;
                        return this._sendDataTransfer('pcmTone', [f, 1], b.data, [{
                            offset: 0,
                            type: SFType.UINT32,
                            value: a
                        }, {
                            offset: 4,
                            type: SFType.UINT32,
                            value: e
                        }], (a) => {
                            if (d && d.setTaskProgress(a), 100 === a) {
                                if (DEBUG.SKIP_SEND_PATCH_WRITE) return void d.finishSubtask();
                                if (!this._sendDataWrite('tone', f)) return !1;
                                d && d.finishSubtask()
                            }
                        }).then(() => {
                            return Utils.wait(NEXT_SYSEX_SEND_WAIT)
                        })
                    })
                });
                return f.then(() => {
                    return this._sendDataTransfer('kit', [c, 1], a.kit.data, [{
                        offset: 388,
                        step: 52,
                        type: SFType.UINT16,
                        value: b
                    }], (a) => {
                        if (d && d.setTaskProgress(a), 100 === a) {
                            if (DEBUG.SKIP_SEND_PATCH_WRITE) return void d.finishSubtask();
                            if (!this._sendDataWrite('kit', c)) return !1;
                            d && d.finishSubtask()
                        }
                    }).then(() => {
                        return Utils.wait(NEXT_SYSEX_SEND_WAIT)
                    }).then(() => {
                        return this._requestKits((a) => {
                            this._deviceStatus.kits[a.id] = a, d && d.finishSubtask()
                        }, c)
                    }).then(() => {
                        const a = Array.from(new Set(b.filter((a) => null !== a)));
                        return this._requestTones((a) => {
                            this._deviceStatus.tones[a.id - TR8S_CONFIG.minToneId] = a, d && d.finishSubtask()
                        }, a)
                    })
                })
            }).then(() => {
                if (h) {
                    d && d.setTaskContext(Tr8sAsyncStatusContext.SENDING_PATTERN);
                    const e = this._isValidKitId(c);
                    return this._sendDataTransfer('pattern', [b, 1], a.pattern.data, [{
                        offset: 18,
                        type: SFType.UINT8,
                        value: e ? c + 1 : 0
                    }, {
                        offset: 114,
                        type: SFType.UINT8,
                        value: e ? 1 : 0
                    }], (a) => {
                        if (d && d.setTaskProgress(a), 100 === a) {
                            if (DEBUG.SKIP_SEND_PATCH_WRITE) return void d.finishSubtask();
                            if (!this._sendDataWrite('pattern', b)) return !1;
                            d && d.finishSubtask()
                        }
                    }).then(() => {
                        return Utils.wait(NEXT_SYSEX_SEND_WAIT)
                    }).then(() => {
                        return this._requestPatterns((a) => {
                            this._deviceStatus.patterns[a.id] = a, d && d.finishSubtask()
                        }, b)
                    })
                }
            }).then(() => {
                if (h) {
                    const a = TR8S_CONFIG.temp.stp.currentPattern,
                        c = Utils.encode7bitBytes(b, a.dataSize);
                    return this._sendTempParam(a, 0, c)
                }
            }).then(() => {
                if (h) {
                    const a = TR8S_CONFIG.temp.stp.nextPattern,
                        c = Utils.encode7bitBytes(b, a.dataSize);
                    return this._sendTempParam(a, 0, c)
                }
            }).then(() => {
                if (h) {
                    const a = TR8S_CONFIG.temp.stp.patternSelect,
                        c = ((a) => {
                            let b = Array(length);
                            for (let c = 0; 4 > c; c++) b[4 - c - 1] = 15 & a >>> 4 * c;
                            return b
                        })(1 << b % 16);
                    return this._sendTempParam(a, 0, c)
                }
            }).then(() => {
                if (g) {
                    const a = TR8S_CONFIG.temp.stp.currentKit,
                        b = Utils.encode7bitBytes(c, a.dataSize);
                    return this._sendTempParam(a, 0, b)
                }
            }).then(() => {
                return this._requestStorageInfo((a) => {
                    this._deviceStatus.storage = a, d && d.finishSubtask()
                })
            }).then(() => {
                this._resolveDataReferences(this._deviceStatus), d && d.finishTask(), DEBUG.console.log('device status', this._deviceStatus), e()
            }).catch((a) => {
                f(a)
            })
        })
    }
    deleteTones(a, b, c = null) {
        if (a = Array.from(new Set(a.filter((a) => this._isValidToneId(a)))), !a.length) throw new Error('No valid user tone Ids specified.');
        return c && (c.setTaskContext(Tr8sAsyncStatusContext.DELETING_TONE), c.resetTaskProgressRange(0, 4 * a.length + 2)), Promise.resolve().then(() => {
            let d = Promise.resolve();
            for (const e of a) d = d.then(() => {
                return 0 < DEBUG.MIDI_IN_LOG_LEVEL && DEBUG.console.groupCollapsed(`delete tone: ${e}`), Promise.resolve().then(() => {
                    const a = TR8S_CONFIG.temp.tone.category,
                        b = Utils.encode7bitBytes(1, a.dataSize);
                    return this._sendTempParam(a, e, b) ? (c && c.incTaskProgress(), Utils.wait(NEXT_SYSEX_SEND_WAIT)) : Promise.reject(ErrorCode.MidiDeviceCommunicationError)
                }).then(() => {
                    const a = Utils.encode7bitBytes(e, 2);
                    return this._requestUtilityCommand('deleteTone', a, (a) => {
                        const b = a.readUint8();
                        if (0 != b) throw ErrorCode.MidiDeviceCommunicationError;
                        return b
                    }) ? (c && c.incTaskProgress(), Utils.wait(NEXT_SYSEX_SEND_WAIT)) : Promise.reject(ErrorCode.MidiDeviceCommunicationError)
                }).then(() => {
                    return this._sendDataWrite('tone', e) ? (c && c.incTaskProgress(), Utils.wait(NEXT_SYSEX_SEND_WAIT)) : Promise.reject(ErrorCode.MidiDeviceCommunicationError)
                }).finally(() => {
                    0 < DEBUG.MIDI_IN_LOG_LEVEL && DEBUG.console.groupEnd()
                }).then(() => {
                    return this._requestTones((a) => {
                        this._deviceStatus.tones[a.id - TR8S_CONFIG.minToneId] = a, a.isLoaded || b.push(a.id), c && c.incTaskProgress()
                    }, e)
                })
            });
            return d
        }).then(() => {
            return this._requestStorageInfo((a) => {
                this._deviceStatus.storage = a, c && c.incTaskProgress()
            })
        }).then(() => {
            this._resolveDataReferences(this._deviceStatus), c && c.finishTask(), DEBUG.console.log('device status', this._deviceStatus)
        })
    }
    optimize(a = null) {
        return new Promise((b, c) => {
            return a && (a.setTaskContext(Tr8sAsyncStatusContext.OPTIMIZING), a.resetTaskProgressRange(0, 101)), Promise.resolve().then(() => {
                return this._requestUtilityCommand('optimize', null, (b) => {
                    const c = b.readUint8();
                    return !(100 < c) && (a && a.setTaskProgress(c), 100 != c || c)
                }, {
                    timeout: OPTIMIZE_PROGRESS_TIMEOUT
                })
            }).finally(() => {
                return this._sendDataWrite('tone', 16383) ? Utils.wait(NEXT_SYSEX_SEND_WAIT) : Promise.reject(ErrorCode.MidiDeviceCommunicationError)
            }).then(() => {
                return this._requestStorageInfo((b) => {
                    this._deviceStatus.storage = b, a && a.incTaskProgress()
                })
            }).then(() => {
                a && a.finishTask(), b()
            }).catch((a) => {
                c(a)
            })
        })
    }
    sendUnlockSystem() {
        const a = TR8S_CONFIG.utility,
            b = MidiManager.offsetAddress(a.address, a.offsets.command.lock),
            c = this.send(this.makeDt1Sysex(b, Array.of(0)));
        return c && (this._isSystemLocked = !1), c
    }
    backup(b = null) {
        return new Promise((a, c) => {
            const d = [],
                e = [],
                f = {
                    system: 15,
                    pattern: 300,
                    kit: 30,
                    tone: 1,
                    pcmTone: 2,
                    sample: 1000
                };
            let g = 0;
            for (const b of this._deviceStatus.tones) {
                if (!b.isLoaded) continue;
                const a = b.size * b.channel;
                if (0 >= a) continue;
                const c = Math.min(b.address + a, TR8S_CONFIG.maxSampleAddress + 1);
                let d = -131072 & b.address;
                if (!(d < TR8S_CONFIG.minSampleAddress || d > TR8S_CONFIG.maxSampleAddress))
                    for (; d < c;) {
                        const a = {
                            address: d,
                            size: TR8S_CONFIG.sampleSectorSize,
                            progressWeight: f.sample,
                            data: null
                        };
                        d + TR8S_CONFIG.sampleSectorSize > c && (a.size = c - d, a.progressWeight = Math.floor(a.size / TR8S_CONFIG.sampleSectorSize * f.sample) || 1);
                        const b = e.find((b) => b.address == a.address);
                        b ? b.size < a.size && (b.size = a.size, b.progressWeight = a.progressWeight) : e.push(a), d += a.size
                    }
            }
            e.sort((a, b) => {
                return a.address < b.address ? -1 : a.address > b.address ? 1 : 0
            });
            const h = (...a) => {
                    const b = a.reduce((a, b) => {
                            return a + (Utils.isString(b) ? b.length : 4)
                        }, 4),
                        c = new Uint8Array(b),
                        d = new DataView(c.buffer);
                    let e = 0;
                    for (let b of a)
                        if (Utils.isString(b))
                            for (const a of Utils.strToCharCodes(b)) d.setUint8(e, a), e++;
                        else d.setUint32(e, b, !0), e += 4;
                    const f = Utils.calcCrc32(c, {
                        length: e
                    });
                    return d.setUint32(e, f, !0), c
                },
                i = (a, c) => {
                    const e = TR8S_CONFIG.utility.size[a],
                        i = Array(c);
                    let j = Promise.resolve();
                    for (let d = 0; d < c; d++) j = j.then(() => {
                        const c = 'system' === a ? null : [d, 1];
                        return this._requestDataTransfer(a, c, e, (c) => {
                            i[d] = c, b && b.incTaskProgress(f[a])
                        })
                    });
                    return j.then(() => {
                        const f = TR8S_CONFIG.utility.chunkId[a],
                            j = i.reduce((a, b) => {
                                return Utils.calcCrc32(b, {
                                    value: a
                                })
                            }, 0),
                            k = h(f, 0, e * c, 0, c, e, j);
                        g = Utils.calcCrc32(k, {
                            value: g
                        }), d.push(new Blob([k, new Blob(i)])), b && b.incTaskProgress()
                    }).then(() => {
                        return Utils.wait(NEXT_SYSEX_SEND_WAIT)
                    })
                };
            if (b) {
                let a = 0;
                a += 1 * f.system + 1, a += 128 * f.pattern + 1, a += 128 * f.kit + 1, a += 1024 * f.tone + 1, a += 1024 * f.pcmTone + 1, a += e.reduce((a, b) => a + b.progressWeight, 0) + 1, b.resetTaskProgressRange(0, a), b.setTaskContext(Tr8sAsyncStatusContext.MAKING_BACKUP)
            }
            return Promise.resolve().then(() => {
                return i('system', 1)
            }).then(() => {
                return i('pattern', 128)
            }).then(() => {
                return i('kit', 128)
            }).then(() => {
                return i('tone', 1024)
            }).then(() => {
                return i('pcmTone', 1024)
            }).then(() => {
                let a = Promise.resolve();
                for (const c of e) a = a.then(() => {
                    const a = [c.address, c.size];
                    return this._requestDataTransfer('sample', a, c.size, (a) => {
                        c.data = a, b && b.incTaskProgress(c.progressWeight)
                    })
                });
                return a.then(() => {
                    const a = TR8S_CONFIG.maxSampleAddress + 1,
                        c = new Uint8Array(new ArrayBuffer(TR8S_CONFIG.sampleSectorSize)),
                        f = [];
                    let g = TR8S_CONFIG.minSampleAddress;
                    for (const a of e) {
                        for (; g < a.address;)
                            if (g + c.length <= a.address) f.push(c), g += c.length;
                            else {
                                const b = c.subarray(0, a.address - g);
                                f.push(b), g += b.length
                            } f.push(a.data), g += a.data.length
                    }
                    for (; g < a;)
                        if (g + c.length <= a) f.push(c), g += c.length;
                        else {
                            const b = c.subarray(0, a - g);
                            f.push(b), g += b.length
                        } const i = TR8S_CONFIG.utility.chunkId.sample,
                        j = f.reduce((a, b) => {
                            return Utils.calcCrc32(b, {
                                value: a
                            })
                        }, 0),
                        k = h(i, 0, 0, TR8S_CONFIG.storageSize, TR8S_CONFIG.minSampleSector, TR8S_CONFIG.maxSampleSector, j);
                    d.push(new Blob([k, new Blob(f)])), b && b.incTaskProgress()
                })
            }).then(() => {
                b && (b.setTaskContext(Tr8sAsyncStatusContext.SAVING_BACKUP), b.finishTask());
                const c = this._deviceStatus.uid,
                    e = h('TR8S', 0, 5, 0, ' '.repeat(16), c[0], c[1], c[2], 0, 0, 0, g),
                    f = new Blob([e, new Blob(d)], {
                        type: 'application/octet-stream'
                    }),
                    i = document.createElement('a');
                return i.download = DEFAULT_BACKUP_FILENAME, i.rel = 'noopener', i.target = '_blank', i.href = URL.createObjectURL(f), Utils.wait(500, () => {
                    i.click()
                }).finally(() => {
                    URL.revokeObjectURL(i.href)
                })
            }).then(() => {
                a()
            }).catch((a) => {
                c(a)
            })
        })
    }
    updateFirmware(a, b = null) {
        return a.endsWith('/') || (a += '/'), new Promise((c, d) => {
            let e = null,
                f = null;
            return b && b.resetTaskProgressRange(0, 220), Promise.resolve().then(() => {
                b && b.setTaskContext(Tr8sAsyncStatusContext.DOWNLOADING_FIRMWARE);
                const c = new FileReader;
                return c.load(a + TR8S_CONFIG.firmAppName).then(() => {
                    return e = new Uint8Array(c.buffer), b && b.incTaskProgress(10), c.load(a + TR8S_CONFIG.firmParamName)
                }).then(() => {
                    f = new Uint8Array(c.buffer), b && b.incTaskProgress(10)
                }).catch(() => {
                    throw ErrorCode.Tr8sFirmwareDownloadFailedError
                })
            }).then(() => {
                b && b.setTaskContext(Tr8sAsyncStatusContext.SENDING_FIRMWARE);
                const a = {
                    timeout: 60000,
                    wait: NEXT_SYSEX_SEND_WAIT
                };
                return Promise.resolve().then(() => {
                    const a = Utils.strToCharCodes('Updating...                1/2', 32);
                    return this._requestUtilityCommand('display', a, (a) => {
                        const b = a.readUint8();
                        return b
                    }).then(() => {
                        return Utils.wait(NEXT_SYSEX_SEND_WAIT)
                    })
                }).then(() => {
                    const c = b ? b.taskProgress : 0;
                    return this._sendDataTransfer('firmApp', [e.length], e, null, (a) => {
                        b && b.setTaskProgress(c + a)
                    }, a)
                }).then(() => {
                    const a = Utils.strToCharCodes('Updating...                2/2', 32);
                    return this._requestUtilityCommand('display', a, (a) => {
                        const b = a.readUint8();
                        return b
                    }).then(() => {
                        return Utils.wait(NEXT_SYSEX_SEND_WAIT)
                    })
                }).then(() => {
                    const c = b ? b.taskProgress : 0;
                    return this._sendDataTransfer('firmParam', [f.length], f, null, (a) => {
                        b && b.setTaskProgress(c + a)
                    }, a)
                }).finally(() => {
                    this._deviceStatus = {}
                })
            }).then(() => {
                c()
            }).catch((a) => {
                d(a)
            })
        })
    }
    _isValidPatternId(a) {
        return null !== a && void 0 !== a && a >= TR8S_CONFIG.minPatternId && a <= TR8S_CONFIG.maxPatternId
    }
    _isValidKitId(a) {
        return null !== a && void 0 !== a && a >= TR8S_CONFIG.minKitId && a <= TR8S_CONFIG.maxKitId
    }
    _isValidToneId(a) {
        return null !== a && void 0 !== a && a >= TR8S_CONFIG.minToneId && a <= TR8S_CONFIG.maxToneId
    }
    _makeSysexParser(a, b = null) {
        const c = {
            length: 4
        };
        return b && (c.value = b, c.length = b.length), new SysexParser(new Struct(Struct.field('SOX', SFType.UINT8, {
            value: 240
        }), Struct.field('vendorId', SFType.UINT8, {
            value: 65
        }), Struct.field('deviceId', SFType.UINT8, {
            value: this.deviceId
        }), Struct.field('modelId', SFType.UINT8, {
            length: this.modelId.length,
            value: this.modelId
        }), Struct.field('commandId', SFType.UINT8, {
            value: a
        }), Struct.field('address', SFType.UINT8, c)))
    }
    _requestUtilityCommand(a, b, c, d = {}) {
        const e = TR8S_CONFIG.utility,
            f = MidiManager.offsetAddress(e.address, e.offsets.command[a]);
        b = b || Array.of(0);
        const g = this.makeDt1Sysex(f, b),
            h = this._makeSysexParser(18, f);
        return 0 < DEBUG.MIDI_IN_LOG_LEVEL && DEBUG.console.groupCollapsed(`request ${a}: ${Utils.bytesToHexString(b)}`), this.request(g, (a, b) => {
            return b && h.parse(a) ? c(h.dataReader()) : void 0
        }, d).finally(() => {
            0 < DEBUG.MIDI_IN_LOG_LEVEL && DEBUG.console.groupEnd()
        })
    }
    _encodeTransferData(a, b, c, d, e = []) {
        const f = d + c;
        let g, h, i = d,
            j = 0,
            k = 0;
        for (; i < f;)
            for (k = j, a[k] = 0, j++, g = 7; i < f && 0 < g;) {
                h = b[i];
                for (const a of e)
                    if (i >= a.startPos && i < a.endPos) {
                        h = a.bytes[i - a.startPos];
                        break
                    } a[k] |= (128 & h) >>> g, a[j] = 127 & h, i++, j++, g--
            }
        return j
    }
    _decodeTransferData(a, b, c) {
        const d = c.length;
        let e, f = 0,
            g = b;
        for (; f < d;) {
            e = c[f] << 7, f++;
            for (let b = 0; f < d && 7 > b; b++) a[g] = c[f] | 128 & e, f++, g++, e >>>= 1
        }
        return g - b
    }
    _sendDataTransfer(a, b, c, d = null, e = null, f = {}) {
        const g = TR8S_CONFIG.utility,
            h = this._makeSysexParser(18),
            i = new Uint8Array(new ArrayBuffer(1280)),
            j = MidiManager.offsetAddress(g.address, g.offsets.data.progress),
            k = Uint8Array.of(...(b || Array.of(0)).reduce((a, b) => {
                return a.concat(Utils.encode7bitBytes(b, 4))
            }, [])),
            l = MidiManager.offsetAddress(g.address, g.offsets.send[a]),
            m = [],
            n = this.makeDt1Sysex(l, k),
            o = f.wait || DEFAULT_DATA_TRANSFER_WAIT;
        let p = 0;
        if (d) {
            const a = new DataView(i.buffer);
            for (const b of d) {
                const c = Array.isArray(b.value) ? b.value : Array.of(b.value),
                    d = Struct.fieldSize(b.type),
                    e = b.step || d;
                let f = b.offset;
                for (const g of c) {
                    if (null !== g) {
                        switch (b.type) {
                            case SFType.UINT8:
                                a.setUint8(0, g);
                                break;
                            case SFType.UINT16:
                                a.setUint16(0, g, !0);
                                break;
                            case SFType.UINT32:
                                a.setUint32(0, g, !0);
                                break;
                            default:
                                throw new Error(`Invalid type: ${b.type}`);
                        }
                        m.push({
                            startPos: f,
                            endPos: f + d,
                            bytes: i.slice(0, d)
                        })
                    }
                    f += e
                }
            }
        }
        return 0 < DEBUG.MIDI_IN_LOG_LEVEL && DEBUG.console.groupCollapsed(`transfer ${a}: ${Utils.bytesToHexString(k)}`), this.request(n, (a, b) => {
            if (!b || !h.parse(a)) return !0;
            if (Utils.isEqualArray(j, h.header.address)) {
                const a = h.data[0];
                if (100 < a) return !1;
                if (e && !1 === e(a)) return !1;
                if (100 == a) return p
            } else if (Utils.isEqualArray(l, h.header.address) && 0 != h.data[0]) return !1;
            return setTimeout(() => {
                if (p >= c.length) return !1;
                let a = 1024;
                for (; p + a > c.length;) a >>>= 1;
                const b = MidiManager.offsetAddress(g.address, g.offsets.data[a]),
                    d = this._encodeTransferData(i, c, a, p, m),
                    e = this.makeDt1Sysex(b, i.subarray(0, d));
                p += a, this.send(e)
            }, o), !0
        }, f).finally(() => {
            0 < DEBUG.MIDI_IN_LOG_LEVEL && DEBUG.console.groupEnd()
        })
    }
    _requestDataTransfer(a, b, c = null, d = null) {
        const e = TR8S_CONFIG.utility;
        0 >= c && (c = e.size[a]);
        const f = new Uint8Array(c),
            g = Uint8Array.of(...(b || Array.of(0)).reduce((a, b) => {
                return a.concat(Utils.encode7bitBytes(b, 4))
            }, [])),
            h = MidiManager.offsetAddress(e.address, e.offsets.get[a]),
            i = this.makeDt1Sysex(h, g),
            j = this._makeSysexParser(18),
            k = Utils.decode7bitBytes(h),
            l = [];
        let m = 0;
        for (let f = 1024; 0 < f; f >>>= 1) {
            const a = MidiManager.offsetAddress(e.address, e.offsets.data[f]);
            l.push(Utils.decode7bitBytes(a))
        }
        return 0 < DEBUG.MIDI_IN_LOG_LEVEL && DEBUG.console.groupCollapsed(`transfer ${a}: ${Utils.bytesToHexString(g)}`), this.request(i, (a, b) => {
            if (!b || !j.parse(a)) return !0;
            const e = Utils.decode7bitBytes(j.header.address);
            return e == k ? 0 == j.data[0] : !!(0 > l.indexOf(e)) || (m += this._decodeTransferData(f, m, j.data), !(m >= c) || (d && d(f), f))
        }, {
            midiInBufferSize: 1280,
            timeout: 10000
        }).finally(() => {
            0 < DEBUG.MIDI_IN_LOG_LEVEL && DEBUG.console.groupEnd()
        })
    }
    _sendDataWrite(a, b) {
        const c = TR8S_CONFIG.utility,
            d = MidiManager.offsetAddress(c.address, c.offsets.write[a]),
            e = this.makeDt1Sysex(d, Utils.encode7bitBytes(b, 2));
        return this.send(e)
    }
    _requestTempParam(a, b, c) {
        const d = MidiManager.offsetAddress(a.address, a.blockSize, b),
            e = this._makeSysexParser(18),
            f = Utils.encode7bitBytes(a.dataSize, 4),
            g = a.dataCount || 1,
            h = a.dataStep || f;
        let i = d,
            j = this.makeRq1Sysex(i, f),
            k = 0;
        return this.request(j, (a, b) => {
            if (b && e.parse(a)) {
                if (!Utils.isEqualArray(i, e.header.address)) return !0;
                const a = e.dataReader(),
                    b = c(a, k);
                return k++, k < g ? (i = MidiManager.offsetAddress(d, h, k), j = this.makeRq1Sysex(i, f), this.send(j), !0) : b
            }
        })
    }
    _sendTempParam(a, b, c) {
        const d = MidiManager.offsetAddress(a.address, a.blockSize, b),
            e = this.makeDt1Sysex(d, c);
        return this.send(e)
    }
    _requestStorageInfo(a) {
        return this._requestUtilityCommand('freeArea', null, (a) => {
            const b = {
                totalFreeSize: a.read7bitBytesUint32(),
                longestFreeSize: a.read7bitBytesUint32(),
                topFreeAddress: a.read7bitBytesUint32()
            };
            return b.totalFreeSizeRatio = Tr8sDeviceController.calcSampleSizeRatio(b.totalFreeSize), b.longestFreeSizeRatio = Tr8sDeviceController.calcSampleSizeRatio(b.longestFreeSize), b.fragmentRatio = 0 < b.totalFreeSize ? Math.round(1e4 * ((b.totalFreeSize - b.longestFreeSize) / b.totalFreeSize)) / 100 : 0, b
        }).then((a) => {
            return this._requestUtilityCommand('freeToneCount', null, (b) => {
                return a.freeToneCount = b.read7bitBytesUint16(), a
            })
        }).then((b) => {
            a(b)
        })
    }
    _requestCategoryNames(a) {
        return 0 < DEBUG.MIDI_IN_LOG_LEVEL && DEBUG.console.groupCollapsed(`request categoryName`), this._requestTempParam(TR8S_CONFIG.temp.sys.categoryName, 0, (b, c) => {
            const d = b.readString(b.length, {
                trim: !0
            });
            return a(c, d), d
        }).finally(() => {
            0 < DEBUG.MIDI_IN_LOG_LEVEL && DEBUG.console.groupEnd()
        })
    }
    _requestPatterns(a, b = null) {
        return new Promise((c, d) => {
            const e = TR8S_CONFIG.temp.ptn,
                f = function*() {
                    if (Array.isArray(b)) return void(yield* b);
                    if (null !== b) return void(yield parseInt(b, 10));
                    for (let a = TR8S_CONFIG.minPatternId; a <= TR8S_CONFIG.maxPatternId;) yield a, a++
                };
            let g = Promise.resolve();
            for (const b of f()) g = g.then(() => {
                0 < DEBUG.MIDI_IN_LOG_LEVEL && DEBUG.console.groupCollapsed(`request pattern: ${b}`);
                let c = Promise.resolve({
                    id: b
                }).then((a) => {
                    return this._requestTempParam(e.name, a.id, (b) => {
                        return a.name = b.readString(b.length, {
                            trim: !0
                        }), a
                    })
                }).then((a) => {
                    return this._requestTempParam(e.kitReference, a.id, (b) => {
                        return a.kitId = b.readNibbledUint8() - 1, a
                    })
                }).then((a) => {
                    return this._requestTempParam(e.kitReferenceSw, a.id, (b) => {
                        return a.isKitEnabled = 0 != b.readUint8(), a
                    })
                }).then((b) => {
                    a(b)
                }).finally(() => {
                    0 < DEBUG.MIDI_IN_LOG_LEVEL && DEBUG.console.groupEnd()
                });
                return c
            });
            g.then(() => {
                c()
            }).catch((a) => {
                d(a)
            })
        })
    }
    _requestKits(a, b = null) {
        return new Promise((c, d) => {
            const e = TR8S_CONFIG.temp.kit,
                f = function*() {
                    if (Array.isArray(b)) return void(yield* b);
                    if (null !== b) return void(yield parseInt(b, 10));
                    for (let a = TR8S_CONFIG.minKitId; a <= TR8S_CONFIG.maxKitId;) yield a, a++
                };
            let g = Promise.resolve();
            for (const b of f()) g = g.then(() => {
                0 < DEBUG.MIDI_IN_LOG_LEVEL && DEBUG.console.groupCollapsed(`request kit: ${b}`);
                let c = Promise.resolve({
                    id: b
                }).then((a) => {
                    return this._requestTempParam(e.name, a.id, (b) => {
                        return a.name = b.readString(b.length, {
                            trim: !0
                        }), a
                    })
                }).then((a) => {
                    return a.toneIds = Array(e.toneId.dataCount), this._requestTempParam(e.toneId, a.id, (b, c) => {
                        return a.toneIds[c] = b.readNibbledUint16(), a
                    })
                }).then((b) => {
                    a(b)
                }).finally(() => {
                    0 < DEBUG.MIDI_IN_LOG_LEVEL && DEBUG.console.groupEnd()
                });
                return c
            });
            g.then(() => {
                c()
            }).catch((a) => {
                d(a)
            })
        })
    }
    _requestTones(a, b = null) {
        return new Promise((c, d) => {
            const e = TR8S_CONFIG.temp.tone,
                f = function*() {
                    if (Array.isArray(b)) return void(yield* b);
                    if (null !== b) return void(yield parseInt(b, 10));
                    for (let a = TR8S_CONFIG.minToneId; a <= TR8S_CONFIG.maxToneId;) yield a, a++
                };
            let g = Promise.resolve();
            for (const b of f()) g = g.then(() => {
                0 < DEBUG.MIDI_IN_LOG_LEVEL && DEBUG.console.groupCollapsed(`request tone: ${b}`);
                let c = Promise.resolve({
                    id: b
                }).then((a) => {
                    return this._requestTempParam(e.name, a.id, (b) => {
                        return a.name = b.readString(b.length, {
                            trim: !0
                        }), a
                    })
                }).then((a) => {
                    return this._requestTempParam(e.category, a.id, (b) => {
                        return a.categoryId = b.readUint8(), a
                    })
                }).then((a) => {
                    return this._requestTempParam(e.type, a.id, (b) => {
                        return a.type = b.readUint8(), a.isLoaded = 0 != a.type, DEBUG.console.assert(0 == a.type || 2 == a.type, 'invalid type', a), a
                    })
                }).then((a) => {
                    return this._requestTempParam(e.address, a.id, (b) => {
                        return a.address = b.readNibbledUint32(), a
                    })
                }).then((a) => {
                    return this._requestTempParam(e.size, a.id, (b) => {
                        return a.size = b.readNibbledUint32(), a
                    })
                }).then((a) => {
                    return this._requestTempParam(e.channel, a.id, (b) => {
                        return a.channel = b.readUint8(), a.sizeRatio = Tr8sDeviceController.calcSampleSizeRatio(a.size * a.channel), a
                    })
                }).then((b) => {
                    a(b)
                }).finally(() => {
                    0 < DEBUG.MIDI_IN_LOG_LEVEL && DEBUG.console.groupEnd()
                });
                return c
            });
            g.then(() => {
                c()
            }).catch((a) => {
                d(a)
            })
        })
    }
    _resolveDataReferences(a) {
        const b = a.patterns,
            c = a.kits,
            d = a.tones;
        for (const b of c) b.patternIds = [];
        for (const b of d) b.kitIds = [];
        for (const d of b) d.isKitEnabled && c[d.kitId].patternIds.push(d.id);
        for (const b of c)
            for (const a of b.toneIds)
                if (a >= TR8S_CONFIG.minToneId) {
                    const c = d[a - TR8S_CONFIG.minToneId];
                    c.kitIds.includes(b.id) || c.kitIds.push(b.id)
                } for (const b of d) b.kitIds.sort()
    }
    startLockSystem(a = null) {
        return this._requestUtilityCommand('playing', null, (a) => {
            const b = a.readUint8();
            if (0 != b) throw ErrorCode.Tr8sDevicePlayingError;
            return b
        }).then(() => {
            return this._requestUtilityCommand('lock', Array.of(1), (a) => {
                const b = a.readUint8();
                if (0 != b) throw ErrorCode.Tr8sDeviceLockFailedError;
                return this._isSystemLocked = !0, b
            }).then(() => {
                return Utils.wait(SYSTEM_LOCK_WAIT)
            }).then(() => {
                if (a) {
                    const b = Utils.strToCharCodes(a, 32);
                    return this._requestUtilityCommand('display', b, (a) => {
                        const b = a.readUint8();
                        return b
                    })
                }
            })
        })
    }
    endLockSystem() {
        return this._isSystemLocked ? this._requestUtilityCommand('lock', Array.of(0), (a) => {
            const b = a.readUint8();
            if (0 != b) throw ErrorCode.Tr8sDeviceLockFailedError;
            return this._isSystemLocked = !1, b
        }) : Promise.resolve()
    }
}
