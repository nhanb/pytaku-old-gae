// Helper shamelessly ripped off from
// https://github.com/STRML/keyMirror/blob/master/index.js
var keyMirror = function(obj) {
    var ret = {};
    var key;
    if (!(obj instanceof Object && !Array.isArray(obj))) {
        throw new Error('keyMirror(...): Argument must be an object.');
    }
    for (key in obj) {
        if (!obj.hasOwnProperty(key)) {
            continue;
        }
        ret[key] = key;
    }
    return ret;
};

module.exports = {
    events: keyMirror({
        AUTH_ATTEMPT: null,
        AUTH_SUCCESS: null,
        AUTH_FAILURE: null,
    }),
};
