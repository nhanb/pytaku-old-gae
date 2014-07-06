/** @jsx React.DOM */

var AuthMixin = {

    getInitialState: function() {
        var self = this;
        emitter.addListener('login', function() {
            self.setState({loggedIn: true});
        });

        return {
            loggedIn: this.isLoggedIn(),
        };
    },

    isLoggedIn: function() {
        var email = sessionStorage.getItem('email');
        var token = sessionStorage.getItem('token');
        return (typeof(email) === 'string' && typeof(token) === 'string');
    },

    setLoggedIn: function(email, token) {
        sessionStorage.setItem('email', email);
        sessionStorage.setItem('token', token);
        emitter.emitEvent('login');
    },

    getEmail: function() {
        return sessionStorage.getItem('email');
    },

    validateCredentials: function(email, token) {
        var valid = false;
        $.ajax({
            async: false,
            type: 'GET',
            url: '/api/test-token',
            dataType: 'json',
            headers: {
                'X-Email': email,
                'X-Token': token
            },
            success: function() {
                valid = true;
            }
        });
        return valid;
    },
};
