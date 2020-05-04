import {
    DEBUG
} from './Debug.js';
import {
    Utils
} from './Utils.js';
DEBUG.MIDI_IN_LOG_LEVEL = 0;
export class MidiInProcessor {
    constructor(a, b = 512) {
        this._midiIn = a, this._midiInCallback = null, this._userCallback = null, this._buffer = {
            message: new Uint8Array(b),
            length: 0,
            isSysex: !1
        }
    }
    get listening() {
        return !!this._midiInCallback
    }
    start(a) {
        this._userCallback = a, this._midiInCallback || (this._clearBuffer(), this._midiInCallback = (a) => this._handleMidiInEvent(a), this._midiIn.addEventListener('midimessage', this._midiInCallback, !1))
    }
    stop() {
        this._userCallback = null, this._clearBuffer(), this._midiInCallback && (this._midiIn.removeEventListener('midimessage', this._midiInCallback, !1), this._midiInCallback = null)
    }
    processMessage(a, b) {
        0 < DEBUG.MIDI_IN_LOG_LEVEL && DEBUG.console.log(`received MIDI message (${a.length}): ${Utils.bytesToHexString(a)}`), this._userCallback && this._userCallback(a, b)
    }
    _clearBuffer() {
        this._buffer.length = 0, this._buffer.isSysex = !1
    }
    _appendBuffer(...a) {
        for (let b of a) this._buffer.message[this._buffer.length] = b, this._buffer.length++
    }
    _processBuffer() {
        if (this._buffer.length) {
            const a = new Uint8Array(this._buffer.message.buffer, 0, this._buffer.length);
            this.processMessage(a, this._buffer.isSysex), this._clearBuffer()
        }
    }
    _handleMidiInEvent(a) {
        try {
            for (let b of a.data) {
                if (128 <= b) {
                    if (248 <= b) {
                        this.processMessage(Uint8Array.of(b), !1);
                        continue
                    }
                    if (247 == b) {
                        this._appendBuffer(b), this._processBuffer();
                        continue
                    }
                    this._processBuffer(), this._appendBuffer(b), this._buffer.isSysex = 240 == b;
                    continue
                }
                this._appendBuffer(b)
            }
            this._buffer.isSysex || this._processBuffer()
        } catch (a) {
            DEBUG.console.error(a), this._clearBuffer()
        }
    }
}
