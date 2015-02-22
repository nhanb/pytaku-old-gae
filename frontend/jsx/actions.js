var dispatcher = require('./dispatcher.js');
var consts = require('./constants.js');

var auth = function(data, endpoint) {
    dispatcher.dispatch({
        eventName: consts.events.AUTH_ATTEMPT,
        data: data,
    });

    $.ajax({
        dataType: 'json',
        url: '/api/' + endpoint,
        method: 'POST',
        data: JSON.stringify(data),

        success: function(resp) {
            dispatcher.dispatch({
                eventName: consts.events.AUTH_SUCCESS,
                data: resp,
            });

        }, error: function(resp) {
            dispatcher.dispatch({
                eventName: consts.events.AUTH_FAILURE,
                data: resp,
            });
        },
    });
};

var register = function(data) {
    return auth(data, 'register');
};

var login = function(data) {
    return auth(data, 'login');
};

module.exports = {
    login: login,
    regster: register,
};
