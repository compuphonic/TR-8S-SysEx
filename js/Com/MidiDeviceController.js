import {
    DEBUG
} from './Debug.js';
import {
    ErrorCode
} from './ErrorCode.js';
import {
    MidiManager
} from './MidiManager.js';
import {
    MidiInProcessor
} from './MidiInProcessor.js';
import {
    Utils
} from './Utils.js';
DEBUG.MIDI_OUT_LOG_LEVEL = 0;
const STATE_CONNECTED = 'connected',
    STATE_DISCONNECTED = 'disconnected';
export class MidiDeviceController {
    constructor(a, b, c = 16) {
        this._deviceName = a, this._deviceId = c, this._modelId = Uint8Array.from(b), this._midiManager = null, this._midiIn = null, this._midiOut = null, this._midiInStateCallback = null, this._midiOutStateCallback = null, this._disconnectCallback = null
    }
    get initialized() {
        return !!this._midiManager
    }
    get deviceName() {
        return this._deviceName
    }
    get deviceId() {
        return this._deviceId
    }
    get modelId() {
        return this._modelId
    }
    get deviceStatus() {
        return {}
    }
    get midiInConnected() {
        return !!this._midiIn && this._midiIn.state === STATE_CONNECTED
    }
    get midiOutConnected() {
        return !!this._midiOut && this._midiOut.state === STATE_CONNECTED
    }
    get connected() {
        return this.midiInConnected && this.midiOutConnected
    }
    initialize() {
        const a = new MidiManager;
        return this.close(), a.initialize().then(() => {
            this._midiManager = a
        })
    }
    midiInOpen() {
        if (this._midiIn) {
            if (this._midiIn.state === STATE_CONNECTED) return !0;
            this.midiInClose()
        }
        return (this._midiIn = this._midiManager.findMidiIn(this.deviceName), !!this._midiIn) && (this._midiInStateCallback = (a) => this._handleStateEvent(a), this._midiIn.addEventListener('statechange', this._midiInStateCallback, !1), !0)
    }
    midiInClose() {
        this._midiInStateCallback && (this._midiIn.removeEventListener('statechange', this._midiInStateCallback, !1), this._midiInStateCallback = null), this._midiIn = null
    }
    midiOutOpen() {
        if (this._midiOut) {
            if (this._midiOut.state === STATE_CONNECTED) return !0;
            this.midiOutClose()
        }
        return (this._midiOut = this._midiManager.findMidiOut(this.deviceName), !!this._midiOut) && (this._midiOutStateCallback = (a) => this._handleStateEvent(a), this._midiOut.addEventListener('statechange', this._midiOutStateCallback, !1), !0)
    }
    midiOutClose() {
        this._midiOutStateCallback && (this._midiOut.removeEventListener('statechange', this._midiOutStateCallback, !1), this._midiOutStateCallback = null), this._midiOut = null
    }
    open() {
        return this.midiOutOpen() && this.midiInOpen()
    }
    close() {
        this.midiOutClose(), this.midiInClose()
    }
    setDisconnectCallback(a) {
        this._disconnectCallback = a
    }
    _handleStateEvent(a) {
        try {
            (a.port === this._midiIn || a.port === this._midiOut) && a.port.state !== STATE_CONNECTED && (this.close(), this._disconnectCallback && setTimeout(() => {
                try {
                    this._disconnectCallback()
                } catch (a) {
                    DEBUG.console.error(a)
                }
            }, 0))
        } catch (a) {
            DEBUG.console.error(a)
        }
    }
    updateDeviceStatus() {
        return this.initialize().then(() => {
            if (!this.open()) return Promise.reject(ErrorCode.MidiDeviceNotConnectedError)
        })
    }
    send(a) {
        return !!this.midiOutConnected && (this._midiOut.send(a), 0 < DEBUG.MIDI_OUT_LOG_LEVEL && DEBUG.console.log(`send MIDI message (${a.length}): ${Utils.bytesToHexString(a)}`), !0)
    }
    request(a, b, {
        timeout: c = 5e3,
        timeoutCallback: d = null,
        midiInBufferSize: e = 512
    } = {}) {
        return new Promise((f, g) => {
            let h = null,
                i = null;
            const j = () => {
                    h && h.stop(), i && (clearTimeout(i), i = null)
                },
                k = () => {
                    i && (clearTimeout(i), i = null);
                    const a = () => {
                        try {
                            if (d && d()) return void(i = setTimeout(a, c));
                            j(), g(ErrorCode.MidiDeviceCommunicationError)
                        } catch (a) {
                            DEBUG.console.error(a), j(), g(a)
                        }
                    };
                    i = setTimeout(a, c)
                };
            try {
                if (h = new MidiInProcessor(this._midiIn, e), k(), h.start((a, c) => {
                        try {
                            const d = b(a, c);
                            void 0 !== d && (!0 === d ? k() : (j(), !1 === d ? g(ErrorCode.MidiDeviceCommunicationError) : f(d)))
                        } catch (a) {
                            DEBUG.console.error(a), j(), g(a)
                        }
                    }), !this.send(a)) throw new Error(`Failed to send MIDI message.`)
            } catch (a) {
                DEBUG.console.error(a), j(), g(ErrorCode.MidiDeviceCommunicationError)
            }
        })
    }
    makeSysex(a, b, c = null) {
        return MidiManager.makeSysex(this.deviceId, this.modelId, a, b, c)
    }
    makeDt1Sysex(a, b, c = null) {
        return MidiManager.makeDt1Sysex(this.deviceId, this.modelId, a, b, c)
    }
    makeRq1Sysex(a, b, c = null) {
        return MidiManager.makeRq1Sysex(this.deviceId, this.modelId, a, b, c)
    }
}
