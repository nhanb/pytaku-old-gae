/** @jsx React.DOM */
var store = require('./store.js');
var storeKey = 'webtoonMode';

module.exports = {
    isEnabled: function() {
        return store.persistentGet(storeKey, false);
    },
    set: function(enableStatus) {
        return store.persistentSet(storeKey, enableStatus);
    },
};
