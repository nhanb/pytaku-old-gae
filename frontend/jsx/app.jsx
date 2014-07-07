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
        return {
            route: app.HOME
        };
    },

    render: function() {
        var routeComponent;
        switch (this.state.route) {
            case app.REGISTER:
                routeComponent = <Register />;
                break;
            case app.LOGIN:
                routeComponent = <Login />;
                break;
            case app.SEARCH:
                routeComponent = <Search query={this.state.query}/>;
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
                <Navbar />
                {routeComponent}
            </div>
        );
    }
});

React.renderComponent(<PytakuApp />, document.getElementById('app'));
