import {
    ApiResult
} from './ApiResult.js';
import {
    DEBUG
} from './Debug.js';
import {
    ErrorCode
} from './ErrorCode.js';
export class Api {
    constructor() {
        this._deviceController = null, this._patchManager = null
    }
    initialize() {
        throw new Error('Not implemented.')
    }
    getPatchInfo(a) {
        try {
            if (this._patchManager) return this._patchManager.getPatch(a)
        } catch (a) {
            DEBUG.console.error(a)
        }
        return null
    }
    getPatchCount() {
        try {
            if (this._patchManager) return this._patchManager.patchCount
        } catch (a) {
            DEBUG.console.error(a)
        }
        return 0
    }
    getDeviceStatus() {
        try {
            if (this._deviceController) return this._deviceController.deviceStatus
        } catch (a) {
            DEBUG.console.error(a)
        }
        return null
    }
    updateDeviceStatus(a) {
        try {
            this._deviceController.updateDeviceStatus().then(() => {
                a(new ApiResult(ErrorCode.NoError))
            }).catch((b) => {
                a(new ApiResult(b))
            })
        } catch (b) {
            DEBUG.console.error(b), setTimeout(() => {
                a(new ApiResult(b))
            }, 0)
        }
    }
    setDeviceDisconnectCallback(a) {
        try {
            this._deviceController.setDisconnectCallback(a)
        } catch (a) {
            return DEBUG.console.error(a), new ApiResult(a)
        }
        return new ApiResult(ErrorCode.NoError)
    }
}
