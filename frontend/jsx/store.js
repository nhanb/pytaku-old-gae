exports.get = function(key) {
    return JSON.parse(sessionStorage.getItem(key));
};

exports.set = function(key, val) {
    sessionStorage.setItem(key, JSON.stringify(val));
};
