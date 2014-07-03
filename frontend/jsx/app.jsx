/** @jsx React.DOM */
$(document).ready(function() {
    var routed = document.getElementById('routed');

    var routes = {
        '/': function() {React.renderComponent(<Home />, routed);},
        '/register': function() {React.renderComponent(<Register />, routed);},
        '/search': function() {React.renderComponent(<Search />, routed);},
        '/search/(.+)': function(query) {
            React.renderComponent(<Search query={query} />, routed);
        },
        '/title/(.+)': function(url) {
            React.renderComponent(<Title url={url} />, routed);
        },
        '/chapter/(.+)': function(url) {
            React.renderComponent(<Chapter url={url} />, routed);
        }
    };
    var routerHandler = new Router(routes);
    routerHandler.init('/');
});
