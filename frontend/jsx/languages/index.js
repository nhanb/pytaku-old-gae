/** @jsx React.DOM */
var yaml = require('js-yaml');
var store = require('../store.js');
var loaded = {};
var supported = [
    ['en', 'english'],
    ['vi', 'vietnamese'],
];

var chosen = localStorage.getItem('lang_chosen');
if (!chosen) {
    chosen = supported[0][0];
}

var url = '/static/languages/' + chosen + '.yaml'
var loaded = $.ajax({
    async: false,
    url: url
}).responseText;

loaded = yaml.load(loaded);

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
