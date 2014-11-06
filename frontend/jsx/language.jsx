/** @jsx React.DOM */
var yaml = require('js-yaml');
var store = require('./store.js');

var chosen = localStorage.getItem('lang_chosen');
if (!chosen) {
    chosen = 'en';
}
loaded = store.persistentGet('lang_loaded_' + chosen);

if (!loaded) {
    var url = '/languages/' + chosen + '.yaml'
    loaded = $.ajax({
        async: false,
        url: url
    }).responseText;
}

loaded = yaml.load(loaded);

var setLanguage = function(lang, callback) {
    localStorage.setItem('lang_chosen', lang);
    location.reload();
}

var echo = function(code) {
    if (!loaded.hasOwnProperty(code)) {
        return code;
    }

    return loaded[code];
}

module.exports = {
    set: setLanguage,
    loaded: loaded,
    echo: echo,
};
