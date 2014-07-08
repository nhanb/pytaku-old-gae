/** @jsx React.DOM */

var app = {
    HOME: 'home',
    REGISTER: 'register',
    LOGIN: 'login',
    SEARCH: 'search',
    TITLE: 'title',
    CHAPTER: 'chapter'
};

var PytakuApp = React.createClass({
    componentDidMount: function() {
        var setState = this.setState;
        var self = this;
        var router = Router({
            '/': setState.bind(this, {route: app.HOME}),
            '/register': setState.bind(this, {route: app.REGISTER}),
            '/login': setState.bind(this, {route: app.LOGIN}),
            '/search': setState.bind(this, {route: app.SEARCH}),

            '/search/(.+)': (function() {
                return function(query) {
                    self.setState({
                        route: app.SEARCH,
                        query: query
                    });
                };
            })(),

            '/title/(.+)': (function() {
                return function(query) {
                    self.setState({
                        route: app.TITLE,
                        url: query
                    });
                };
            })(),

            '/chapter/(.+)': (function() {
                return function(query) {
                    self.setState({
                        route: app.CHAPTER,
                        url: query
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
            this.validateCredentialsFunc()();
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
                    query={this.state.query}/>;
                break;
            case app.TITLE:
                routeComponent = <Title url={this.state.url}/>;
                break;
            case app.CHAPTER:
                routeComponent = <Chapter url={this.state.url}/>;
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
            self.setState({
                loggedIn: true,
                email: email,
            });
        };
    },

    logoutFunc: function() {
        var self = this;
        return function() {
            localStorage.removeItem('email');
            localStorage.removeItem('token');
            self.authedAjax({
                url: '/api/logout',
                method: 'POST'
            });
            self.setState({loggedIn: false});
        };
    },

    validateCredentialsFunc: function() {
        var self = this;
        return function(email, token) {
            self.authedAjax({
                url: '/api/test-token',
                error: function() {
                    alert('Access token mismatched. Please login again :)');
                    self.setState({loggedIn: false});
                }
            });
        };
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
    },
});

React.renderComponent(<PytakuApp />, document.getElementById('app'));
