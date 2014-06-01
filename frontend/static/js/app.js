App = Ember.Application.create();

App.LoginController = Ember.Controller.extend({
    reset: function() {
        this.setProperties({
            email: '',
            password: '',
            errorMessage: ''
        });
    },
    login: function() {
        var self = this;
        self.set('errorMessage', null);

        var data = this.getProperties('email', 'password');
        $.post('/api/auth', JSON.stringify(data)).success(function(resp) {
            self.set('token', resp.token);
            self.set('loggedIn', true);
        }).fail(function(err) {
            self.set('errorMessage', err.responseJSON.msg);
        });
    }
});

App.RegisterController = Ember.Controller.extend({
    register: function() {
        var self = this;
        var data = this.getProperties('email', 'password');
        $.post('/api/user', JSON.stringify(data)).success(function(resp) {
            self.set('token', resp.token);
        }).fail(function(err) {
            self.set('errorMessage', err.responseJSON.msg);
        });
    }
});

App.Router.map(function() {
    this.resource('login');
    this.resource('register');
    this.resource('search', function() {
        this.resource('result', {path: ':query'})
    });
});

App.LoginRoute = Ember.Route.extend({
    setupController: function(controller, context) {
        controller.reset();
    }
});

App.ResultRoute = Ember.Route.extend({
    model: function(params) {
        return $.getJSON('/api/search?keyword=' + encodeURIComponent(params.query));
    }
});
