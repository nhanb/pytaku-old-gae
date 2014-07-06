/** @jsx React.DOM */

var AuthMixin = {

    getInitialState: function() {
        var self = this;
        emitter.addListener('login', function() {
            if (self.hasOwnProperty('handleLogin')) {
                self.handleLogin();
            }
        });
        emitter.addListener('logout', function() {
            if (self.hasOwnProperty('handleLogout')) {
                self.handleLogout();
            }
        });

        return {
            loggedIn: this.isLoggedIn(),
        };
    },

    isLoggedIn: function() {
        var email = localStorage.getItem('email');
        var token = localStorage.getItem('token');
        return (typeof(email) === 'string' && typeof(token) === 'string');
    },

    setLoggedIn: function(email, token) {
        localStorage.setItem('email', email);
        localStorage.setItem('token', token);
        emitter.emitEvent('login');
    },

    logout: function() {
        this.authedAjax({
            url: '/api/logout',
            method: 'POST',
            success: function() {
                localStorage.removeItem('email');
                localStorage.removeItem('token');
                emitter.emitEvent('logout');
            }
        });
    },

    getEmail: function() {
        return localStorage.getItem('email');
    },

    validateCredentials: function(email, token) {
        var valid = false;
        this.authedAjax({
            async: false,
            url: '/api/test-token',
            success: function() {
                valid = true;
            }
        });
        return valid;
    },

    authedAjax: function(options) {
        var email = localStorage.getItem('email');
        var token = localStorage.getItem('token');
        options.dataType = 'json';
        options.headers = {
            'X-Email': email,
            'X-Token': token
        };
        return $.ajax(options);
    }
};

// =========== The following mixins assume AuthMixin is also used ============

var RequireLoginMixin = {
    componentDidMount: function() {
        if (this.isLoggedIn() === false) {
            window.location.href = '/#/login';
        }
    },
};
