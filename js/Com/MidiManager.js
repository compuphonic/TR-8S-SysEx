import {
    ErrorCode
} from './ErrorCode.js';
import {
    Utils
} from './Utils.js';
export class MidiManager {
    constructor() {
        this._midiAccess = null
    }
    initialize(a = {
        sysex: !0
    }) {
        return new Promise((b, c) => {
            navigator.requestMIDIAccess ? navigator.requestMIDIAccess(a).then((a) => {
                this._midiAccess = a, b()
            }).catch((a) => {
                c(a)
            }) : c(ErrorCode.MidiApiNotSupportedError)
        })
    }
    findMidiIn(a) {
        if (!this._midiAccess) return null;
        for (let b of this._midiAccess.inputs.values())
            if (b.name.includes(a)) return b;
        return null
    }
    findMidiOut(a) {
        if (!this._midiAccess) return null;
        for (let b of this._midiAccess.outputs.values())
            if (b.name.includes(a)) return b;
        return null
    }
    static makeSysex(a, b, c, d, e = null) {
        return null === e && (e = MidiManager.calcChecksum(d)), Uint8Array.of(240, 65, a, ...b, c, ...d, e, 247)
    }
    static makeDt1Sysex(a, b, c, d, e = null) {
        const f = Uint8Array.of(...c, ...d);
        return MidiManager.makeSysex(a, b, 18, f, e)
    }
    static makeRq1Sysex(a, b, c, d, e = null) {
        const f = Uint8Array.of(...c, ...d);
        return MidiManager.makeSysex(a, b, 17, f, e)
    }
    static calcChecksum(a, b = 0, c = null) {
        let d = 0;
        c || (c = a.length);
        for (let e = 0; e < c; e++) d += a[b + e];
        return d = 127 & 128 - (127 & d), d
    }
    static offsetAddress(a, b, c = 1) {
        let d = Utils.decode7bitBytes(a);
        return d += (Utils.isArrayOrTypedArray(b) ? Utils.decode7bitBytes(b) : b) * c, Utils.encode7bitBytes(d, a.length)
    }
}
