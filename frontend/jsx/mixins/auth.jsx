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
            setTimeout(function() {
                window.location.href = '/#/login';
            }, 50);
            // Notice the stupid setTimeout? For whatever reason if you visit a
            // "requireLogin" route directly using the address bar (instead of
            // clicking its link from another route), then you will be
            // redirected to the login route WITHOUT the previous route in your
            // history (at least for Chrome). Delaying the redirection with a
            // setTimeout() seems to solve that. Of course I'll need to find
            // some proper fix for this but for now... whatever!
        }
    },

    handleLogout: function() {
        // When user wants to log out, they probably just want to close this
        // page and not need to be redirected to any specific route.
        // Home will do!
        window.location.href = '/#/';
    }
};

var HideWhenLoggedInMixin = {
    hideWhenLoggedIn: function() {
        if (this.isLoggedIn() === true) {
            if (history.length > 2) { // new tab (blank) page + current page
                history.back();
            } else {
                window.location.href = '/#/';
            }
        }
    },
    componentDidMount: function() {
        this.hideWhenLoggedIn();
    },
    handleLogin: function() {
        this.hideWhenLoggedIn();
    },
};
