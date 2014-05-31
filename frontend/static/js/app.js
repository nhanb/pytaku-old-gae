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
    this.resource('sites', function() {
        this.resource('site', {path: ':site_id'});
    });
});

var attr = DS.attr,
    hasMany = DS.hasMany,
    belongsTo = DS.belongsTo;

App.SitesRoute = Ember.Route.extend({
    model: function() {
        return this.store.find('site');
    }
});

App.Site = DS.Model.extend({
    domain: attr('string'),
    titles: hasMany('title')
});

App.Title = DS.Model.extend({
    name: attr('string'),
    url: attr('string'),
    site: belongsTo('site')
});

App.Title.FIXTURES = [{
    id: 1,
    name: 'Naruto',
    url: 'http://kissmanga.com/Manga/Naruto'
}, {
    id: 2,
    name: 'Tsubasa Reservoir Chronicles',
    url: 'http://kissmanga.com/Manga/Tsubasa-Reservoir-Chronicles'
}];
App.Site.FIXTURES = [{
    id: 1,
    domain: 'kissmanga.com',
    titles: [1, 2]
}, {
    id: 2,
    domain: 'mangafox.com',
    titles: []
}, {
    id: 3,
    domain: 'batoto.com',
    titles: []
}];

