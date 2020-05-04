import {
    ErrorCode
} from './ErrorCode.js';
export class ApiResult {
    constructor(a, b = {}) {
        'number' == typeof a ? this.error = a : (this.error = ErrorCode.SystemError, this.errorDescription = a), Object.keys(b).forEach((a) => {
            this[a] = b[a]
        })
    }
}
