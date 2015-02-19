/** @jsx React.DOM */
var store = require('./store.js');
var storeKey = 'enableShortcut';

module.exports = {
    isEnabled: function() {
        return store.persistentGet(storeKey, false);
    },
    set: function(enableStatus) {
        return store.persistentSet(storeKey, enableStatus);
    },
};
