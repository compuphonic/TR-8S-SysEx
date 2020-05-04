import {
    DEBUG
} from '../Com/Debug.js';
import {
    PatchManager
} from '../Com/PatchManager.js';
import {
    Utils
} from '../Com/Utils.js';
import {
    Tr8sPatchLoader
} from './Tr8sPatchLoader.js';
export class Tr8sPatchManager extends PatchManager {
    constructor() {
        super()
    }
    initialize(a) {
        const b = new Tr8sPatchLoader;
        return b.parse(a).then((a) => {
            this._patches = a
        })
    }
    get patches() {
        return this._patches ? this._patches : []
    }
}
