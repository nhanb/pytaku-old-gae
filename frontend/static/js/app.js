App = Ember.Application.create();
App.ApplicationAdapter = DS.FixtureAdapter;

App.LoginController = Ember.Controller.extend({
    login: function() {
        var self = this;
        var data = this.getProperties('email', 'password');
        $.post('/api/auth', JSON.stringify(data)).then(function(resp) {
            if (resp.success) {
                self.set('token', resp.token);
                self.set('loggedIn', true);
                console.log(JSON.stringify(resp));
            } else {
                self.set('errorMessage', resp.msg);
            }
        });
    }
});

App.RegisterController = Ember.Controller.extend({
    register: function() {
        var self = this;
        var data = this.getProperties('email', 'name', 'password');
        $.post('/api/users', JSON.stringify(data)).then(function(resp) {
            if (resp.success) {
                self.set('token', resp.token);
                console.log(JSON.stringify(resp));
            } else {
                self.set('errorMessage', resp.msg);
            }
        });
    }
});

App.Router.map(function() {
    this.resource('login');
    this.resource('register');
    this.resource('sites');
});

App.SitesRoute = Ember.Route.extend({
    model: function() {
        return this.store.find('site');
    }
});

App.Site = DS.Model.extend({
    domain: DS.attr('string')
});

App.Site.FIXTURES = [
    {id: 1, domain: 'kissmanga.com'},
    {id: 2, domain: 'mangafox.com'},
    {id: 3, domain: 'batoto.com'}
];
