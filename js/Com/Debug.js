export {
    Debug as DEBUG
};
class Debug {
    static get console() {
        return Debug.enabled ? console : Debug.dummy_console
    }
    static do_nothing(...a) {}
}
Debug.enabled = !1, Debug.dummy_console = new Proxy({}, {
    get: function() {
        return Debug.do_nothing
    }
});
