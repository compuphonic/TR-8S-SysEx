import {
    Api
} from '../Com/Api.js';
import {
    ApiResult
} from '../Com/ApiResult.js';
import {
    DEBUG
} from '../Com/Debug.js';
import {
    ErrorCode
} from './Tr8sErrorCode.js';
import {
    Tr8sAsyncStatus
} from './Tr8sAsyncStatus.js';
import {
    Tr8sDeviceController
} from './Tr8sDeviceController.js';
import {
    Tr8sPatchManager
} from './Tr8sPatchManager.js';
export {
    ErrorCode,
    DEBUG
};
const Tr8sPatchSendStatus = {
    OK: 0,
    UNKNOWN: 1,
    NO_FREE_TONE: 2,
    NO_FREE_SPACE: 3,
    NEED_OPTIMIZE: 4
};
export class Tr8sApi extends Api {
    constructor() {
        super()
    }
    initialize(a, b, c) {
        try {
            this._deviceController = new Tr8sDeviceController(b), this._patchManager = new Tr8sPatchManager, this._patchManager.initialize(a).then(() => {
                c(new ApiResult(ErrorCode.NoError))
            }).catch((a) => {
                c(new ApiResult(a))
            })
        } catch (a) {
            DEBUG.console.error(a), setTimeout(() => {
                c(new ApiResult(a))
            }, 0)
        }
    }
    getDeviceStatus() {
        let a = {
            isConnected: !1,
            isSupported: !1,
            deviceName: null,
            version: null,
            categoryNames: [],
            patterns: [],
            kits: [],
            tones: [],
            storage: null
        };
        try {
            const b = this._deviceController.deviceStatus;
            a.isConnected = this._deviceController.connected, a.isSupported = a.isConnected && b.isValid, a.deviceName = a.isConnected ? this._deviceController.deviceName : null, a.version = b.version || null, a.categoryNames = b.categoryNames || [], a.patterns = b.patterns || [], a.kits = b.kits || [], a.tones = b.tones || [], b.storage && (a.storage = {
                freeSizeRatio: b.storage.totalFreeSizeRatio,
                fragmentRatio: b.storage.fragmentRatio,
                freeToneCount: b.storage.freeToneCount
            })
        } catch (a) {
            DEBUG.console.error(a)
        }
        return a
    }
    updateDeviceStatus(a) {
        const b = new Tr8sAsyncStatus(1);
        try {
            this._deviceController.updateDeviceStatus(b).then(() => {
                const a = this.getPatchCount(),
                    b = new Map;
                for (let c = 0; c < a; c++) {
                    const a = this.getPatchInfo(c).sendStatus;
                    if (a === Tr8sPatchSendStatus.OK) return;
                    b.set(a, (b.get(a) || 0) + 1)
                }
                return b.get(Tr8sPatchSendStatus.NO_FREE_TONE) ? Promise.reject(ErrorCode.Tr8sStorageNoFreeToneError) : b.get(Tr8sPatchSendStatus.NO_FREE_SPACE) ? Promise.reject(ErrorCode.Tr8sStorageNoFreeSpaceError) : b.get(Tr8sPatchSendStatus.NEED_OPTIMIZE) ? Promise.reject(ErrorCode.Tr8sStorageNeedsOptimizeError) : void 0
            }).then(() => {
                a(new ApiResult(ErrorCode.NoError))
            }).catch((b) => {
                a(new ApiResult(b))
            })
        } catch (b) {
            DEBUG.console.error(b), setTimeout(() => {
                a(new ApiResult(b))
            }, 0)
        }
        return b
    }
    _determinePatchSendStatus(a) {
        const b = this._deviceController.deviceStatus,
            c = (a.userTones || []).length;
        return b.isValid ? c > b.storage.freeToneCount ? Tr8sPatchSendStatus.NO_FREE_TONE : a.sampleSize > b.storage.longestFreeSize ? a.sampleSize > b.storage.totalFreeSize ? Tr8sPatchSendStatus.NO_FREE_SPACE : Tr8sPatchSendStatus.NEED_OPTIMIZE : Tr8sPatchSendStatus.OK : Tr8sPatchSendStatus.UNKNOWN
    }
    getPatchInfo(a) {
        let b = null;
        try {
            const c = super.getPatchInfo(a),
                d = c.pattern || {},
                e = c.kit || {},
                f = (c.userTones || []).length;
            b = {
                patternName: d.name || null,
                kitName: e.name || null,
                userToneCount: f,
                sampleSizeRatio: c.sampleSizeRatio,
                sendStatus: this._determinePatchSendStatus(c)
            }
        } catch (a) {
            DEBUG.console.error(a), b = null
        }
        return b
    }
    sendPatch(a, b, c, d) {
        const e = new Tr8sAsyncStatus(2);
        try {
            this._deviceController.startLockSystem('Receiving Data..').then(() => {
                return this._deviceController.updateDeviceStatus(e, {
                    excludes: ['kits', 'tones']
                })
            }).then(() => {
                const d = this._patchManager.getPatch(a),
                    f = this._determinePatchSendStatus(d);
                if (f !== Tr8sPatchSendStatus.OK) {
                    let a = ErrorCode.MidiDeviceCommunicationError;
                    return f === Tr8sPatchSendStatus.NO_FREE_TONE ? a = ErrorCode.Tr8sStorageNoFreeToneError : f === Tr8sPatchSendStatus.NO_FREE_SPACE ? a = ErrorCode.Tr8sStorageNoFreeSpaceError : f === Tr8sPatchSendStatus.NEED_OPTIMIZE ? a = ErrorCode.Tr8sStorageNeedsOptimizeError : void 0, Promise.reject(a)
                }
                return this._deviceController.sendPatch(d, b, c, e)
            }).finally(() => {
                return this._deviceController.endLockSystem()
            }).then(() => {
                d(new ApiResult(ErrorCode.NoError))
            }).catch((a) => {
                d(new ApiResult(a))
            })
        } catch (a) {
            DEBUG.console.error(a), setTimeout(() => {
                d(new ApiResult(a))
            }, 0)
        }
        return e
    }
    deleteTones(a, b) {
        const c = new Tr8sAsyncStatus(2);
        try {
            const d = [];
            this._deviceController.startLockSystem('Deleting Tone...').then(() => {
                return this._deviceController.updateDeviceStatus(c, {
                    excludes: ['kits', 'tones']
                })
            }).then(() => {
                return this._deviceController.deleteTones(a, d, c)
            }).finally(() => {
                return this._deviceController.endLockSystem()
            }).then(() => {
                b(new ApiResult(ErrorCode.NoError, {
                    deletedToneIds: d
                }))
            }).catch((a) => {
                b(new ApiResult(a, {
                    deletedToneIds: d
                }))
            })
        } catch (a) {
            DEBUG.console.error(a), setTimeout(() => {
                b(new ApiResult(a, {
                    deletedToneIds: []
                }))
            }, 0)
        }
        return c
    }
    optimize(a) {
        const b = new Tr8sAsyncStatus(2);
        try {
            this._deviceController.startLockSystem('Optimizing...').then(() => {
                return this._deviceController.updateDeviceStatus(b, {
                    excludes: ['kits', 'tones']
                })
            }).then(() => {
                return this._deviceController.optimize(b)
            }).finally(() => {
                return this._deviceController.endLockSystem()
            }).then(() => {
                a(new ApiResult(ErrorCode.NoError))
            }).catch((b) => {
                a(new ApiResult(b))
            })
        } catch (b) {
            DEBUG.console.error(b), setTimeout(() => {
                a(new ApiResult(b))
            }, 0)
        }
        return b
    }
    unlockSystem() {
        try {
            if (!this._deviceController.sendUnlockSystem()) return new ApiResult(ErrorCode.MidiDeviceCommunicationError)
        } catch (a) {
            return new ApiResult(a)
        }
        return new ApiResult(ErrorCode.NoError)
    }
    backup(a) {
        const b = new Tr8sAsyncStatus(2);
        try {
            this._deviceController.startLockSystem('Backup Data...').then(() => {
                return this._deviceController.updateDeviceStatus(b, {
                    excludes: ['kits']
                })
            }).then(() => {
                return this._deviceController.backup(b)
            }).finally(() => {
                return this._deviceController.endLockSystem()
            }).then(() => {
                a(new ApiResult(ErrorCode.NoError))
            }).catch((b) => {
                a(new ApiResult(b))
            })
        } catch (b) {
            DEBUG.console.error(b), setTimeout(() => {
                a(new ApiResult(b))
            }, 0)
        }
        return b
    }
    updateFirmware(a, b) {
        const c = new Tr8sAsyncStatus(2);
        try {
            this._deviceController.startLockSystem('Updating...').then(() => {
                return this._deviceController.updateDeviceStatus(c, {
                    excludes: ['kits', 'tones']
                })
            }).then(() => {
                return this._deviceController.updateFirmware(a, c)
            }).finally(() => {
                return this._deviceController.endLockSystem()
            }).then(() => {
                b(new ApiResult(ErrorCode.NoError))
            }).catch((a) => {
                b(new ApiResult(a))
            })
        } catch (a) {
            DEBUG.console.error(a), setTimeout(() => {
                b(new ApiResult(a))
            }, 0)
        }
        return c
    }
}
