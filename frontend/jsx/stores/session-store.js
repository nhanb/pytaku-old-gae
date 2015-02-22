var dispatcher = require('../dispatcher.js');
var events = require('../constants.js').events;

var EventEmitter = require('wolfy87-eventemitter');
var ee = new EventEmitter();

var sessionStore = {
    email: null,
    remember: false,
    token: null,
    loginStatus: null,
    msg: null,
    msgType: null,

    getAll: function() {
        return {
            email: this.email,
            remember: this.remember,
            token: this.token,
            loginStatus: this.loginStatus,
            msg: this.msg,
            msgType: this.msgType,
        };
    },

    triggerChange: function() {
        ee.emitEvent('change');
    },

    bind: function(func) {
        ee.addListener('change', func);
    },

    unbind: function(func) {
        ee.removeListener('change', func);
    },

    checkLoggedIn: function() {
        return this.loginStatus === 'SUCCESS';
    },
};

dispatcher.register(function(payload) {
    var data = payload.data;
    switch(payload.eventName) {

        case events.AUTH_ATTEMPT:
            sessionStore.loginStatus = 'LOGGING_IN';
            sessionStore.remember = data.remember;
            sessionStore.email = data.email;
            sessionStore.msg = null;
            sessionStore.msgType = null;
            sessionStore.triggerChange('change');
            break;

        case events.AUTH_SUCCESS:
            sessionStore.loginStatus = 'SUCCESS';
            sessionStore.token = data.token;
            sessionStore.remember = false;
            sessionStore.msg = 'Successfully logged in';
            sessionStore.msgType = 'success';
            sessionStore.triggerChange('change');
            break;

        case events.AUTH_FAILURE:
            sessionStore.loginStatus = 'FAILURE';
            sessionStore.email = null;
            sessionStore.token = null;
            sessionStore.msg = data.responseJSON.msg;
            sessionStore.msgType = 'danger';
            sessionStore.triggerChange('change');
            break;
    }

    return true;
});

module.exports = sessionStore;
