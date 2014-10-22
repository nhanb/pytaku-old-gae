/** @jsx React.DOM */
var Chapter = require('./routes/chapter.jsx');
var Home = require('./routes/home.jsx');
var Login = require('./routes/login.jsx');
var SeriesBookmarks = require('./routes/series_bookmarks.jsx');
var ChapterBookmarks = require('./routes/chapter_bookmarks.jsx');
var Register = require('./routes/register.jsx');
var Search = require('./routes/search.jsx');
var Series = require('./routes/series.jsx');
var Navbar = require('./navbar.jsx');
var ScrollToTopBtn = require('./scroll_to_top.jsx');

var app = {
    HOME: 'home',
    REGISTER: 'register',
    LOGIN: 'login',
    SEARCH: 'search',
    SERIES: 'series',
    CHAPTER: 'chapter',
    SBOOKMARKS: 'series-bookmarks',
    CBOOKMARKS: 'chapter-bookmarks',
};

var PytakuApp = React.createClass({
    componentDidMount: function() {
        var setState = this.setState;
        var self = this;
        var router = Router({
            '/': setState.bind(this, {route: app.HOME}),
            '/register': setState.bind(this, {route: app.REGISTER}),
            '/login': setState.bind(this, {route: app.LOGIN}),
            '/series-bookmarks': setState.bind(this, {route: app.SBOOKMARKS}),
            '/chapter-bookmarks': setState.bind(this, {route: app.CBOOKMARKS}),
            '/search': setState.bind(this, {route: app.SEARCH}),

            '/search/(.+)': (function() {
                return function(query) {
                    self.setState({
                        route: app.SEARCH,
                        query: decodeURIComponent(query)
                    });
                };
            })(),

            '/series/(.+)': (function() {
                return function(url) {
                    self.setState({
                        route: app.SERIES,
                        url: decodeURIComponent(url)
                    });
                };
            })(),

            '/chapter/(.+)': (function() {
                return function(url) {
                    self.setState({
                        route: app.CHAPTER,
                        url: decodeURIComponent(url)
                    });
                };
            })(),
        });
        router.init('/');
    },

    getInitialState: function() {
        var email = localStorage.getItem('email');
        var token = localStorage.getItem('token');
        var loggedIn = (typeof(email) === 'string' &&
                        typeof(token) === 'string');

        if (loggedIn === true) {
            var self = this;

            // Check if credentials stored on client are still valid
            self.authedAjax({
                url: '/api/test-token',
                success: function() {
                    if (window.location.hash === '#/') {
                        // TODO: make default route configurable per user
                        window.location.href = '/#/series-bookmarks';
                    }
                },
                error: function() {
                    localStorage.removeItem('token');
                    localStorage.removeItem('email');
                    self.setState({loggedIn: false});
                },
            });
        }
        return {
            route: app.HOME,
            loggedIn: loggedIn,
            email: email
        };
    },

    render: function() {
        var routeComponent;
        switch (this.state.route) {
            case app.REGISTER:
                routeComponent = <Register loggedIn={this.state.loggedIn}
                    setLoggedIn={this.setLoggedInFunc()} />;
                break;
            case app.LOGIN:
                routeComponent = <Login loggedIn={this.state.loggedIn}
                    setLoggedIn={this.setLoggedInFunc()} />;
                break;
            case app.SEARCH:
                routeComponent = <Search loggedIn={this.state.loggedIn}
                    query={this.state.query} ajax={this.ajax} />;
                break;
            case app.SERIES:
                routeComponent = <Series loggedIn={this.state.loggedIn}
                    url={this.state.url} ajax={this.ajax} />;
                break;
            case app.CHAPTER:
                routeComponent = <Chapter url={this.state.url}
                    loggedIn={this.state.loggedIn} ajax={this.ajax} />;
                break;
            case app.SBOOKMARKS:
                routeComponent = <SeriesBookmarks loggedIn={this.state.loggedIn}
                    ajax={this.ajax} />;
                break;
            case app.CBOOKMARKS:
                routeComponent = <ChapterBookmarks loggedIn={this.state.loggedIn}
                    ajax={this.ajax} />;
                break;
            default:
                routeComponent = <Home />;
        }
        return (
            <div>
                <Navbar loggedIn={this.state.loggedIn}
                    logout={this.logoutFunc()}
                    email={this.state.email}/>
                {routeComponent}
            </div>
        );
    },

    /********************************
     * Auth-related functionalities *
     ********************************/

    setLoggedInFunc: function() {
        var self = this;
        return function(email, token) {
            localStorage.setItem('email', email);
            localStorage.setItem('token', token);
            sessionStorage.clear();
            self.setState({
                loggedIn: true,
                email: email,
            });
        };
    },

    logoutFunc: function() {
        var self = this;
        return function() {
            self.authedAjax({
                url: '/api/logout',
                method: 'POST'
            });
            localStorage.removeItem('email');
            localStorage.removeItem('token');
            sessionStorage.clear();
            self.setState({loggedIn: false});
        };
    },

    authedAjax: function(options) {
        var token = localStorage.getItem('token');
        options.dataType = 'json';
        options.headers = {
            'X-Token': token
        };
        return $.ajax(options);
    },

    normalAjax: function(options) {
        options.dataType = 'json';
        return $.ajax(options);
    },

    ajax: function(options) {
        var self=this;
        if (self.state.loggedIn) {
            return self.authedAjax(options);
        } else {
            return self.normalAjax(options);
        }
    }
});

React.renderComponent(<PytakuApp />, document.getElementById('app'));

// "Go to top" button.
// Only show this on non-mobile devices where screen real estate is plenty
if(! /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    React.renderComponent(<ScrollToTopBtn />, document.getElementById('up-component'));
}
