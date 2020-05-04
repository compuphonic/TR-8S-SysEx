import {
    DataReader
} from './DataReader.js';
export class FileReader extends DataReader {
    constructor() {
        super()
    }
    load(a, b = {}, c = !0) {
        return this.setData(null), new Promise((d, e) => {
            fetch(a, b).then((a) => {
                return 200 === a.status ? a.arrayBuffer() : Promise.reject()
            }).then((a) => {
                this.setData(a, 0, a.byteLength, c), d()
            }).catch(() => {
                e(new Error(`Couldn't load "${a}".`))
            })
        })
    }
}
