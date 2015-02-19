var get = function(storage, key, defaultVal) {
    var val = storage.getItem(key);
    return (val !== 'undefined') ? JSON.parse(val) : defaultVal;
};

var set = function(storage, key, val) {
    storage.setItem(key, JSON.stringify(val));
};

exports.get = function(key, defaultVal) {
    return get(sessionStorage, key, defaultVal);
};

exports.set = function(key, val) {
    return set(sessionStorage, key, val);
};

exports.persistentGet = function(key, defaultVal) {
    return get(localStorage, key, defaultVal);
};

exports.persistentSet = function(key, val) {
    return set(localStorage, key, val);
};
