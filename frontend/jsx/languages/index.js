/** @jsx React.DOM */
var yaml = require('js-yaml');
var store = require('../store.js');
var loaded = {};
var supported = [
    ['en', 'english'],
    ['vi', 'vietnamese'],
];

// For some reason, 'require' commands fail when called inside a loop, so we'll
// hardcode the languages for now...
var allLanguages = {};
allLanguages.en = require('../../languages/en.js');
allLanguages.vi = require('../../languages/vi.js');


var chosen = localStorage.getItem('lang_chosen');
if (!chosen) {
    chosen = supported[0][0];
}

loaded = allLanguages[chosen];

var echo = function(code) {
    try {
        return loaded[code];
    } catch (e) {
        return code;
    }
};

var setLanguage = function(lang, callback) {
    localStorage.setItem('lang_chosen', lang);
    location.reload();
};

module.exports = {
    set: setLanguage,
    loaded: loaded,
    echo: echo,
    chosen: chosen,
    supported: supported,
};
