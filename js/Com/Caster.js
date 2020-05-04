export class Caster {
    static toUint8(a) {
        return 255 & a
    }
    static toInt8(a) {
        let b = Caster.toUint8(a);
        return 127 < b && (b -= 256), b
    }
    static toUint16(a) {
        return 65535 & a
    }
    static toInt16(a) {
        let b = Caster.toUint16(a);
        return 32767 < b && (b -= 65536), b
    }
    static toUint32(a) {
        return 0 == (2147483648 & a) ? 2147483647 & a : (2147483647 & a) + 2147483648
    }
    static toInt32(a) {
        return 4294967295 & a
    }
}
