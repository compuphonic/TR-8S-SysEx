import {
    DEBUG
} from './Debug.js';
import {
    ErrorCode
} from './ErrorCode.js';
export class PatchManager {
    initialize() {
        throw new Error('Not implemented.')
    }
    get patches() {
        return []
    }
    get patchCount() {
        try {
            return this.patches.length
        } catch (a) {
            DEBUG.console.error(a)
        }
        return 0
    }
    getPatch(a) {
        try {
            return this.patches[a]
        } catch (a) {
            DEBUG.console.error(a)
        }
        return null
    }
}
