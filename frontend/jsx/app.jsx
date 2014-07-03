/** @jsx React.DOM */
$(document).ready(function() {
    var routed = document.getElementById('routed');

    var routes = {
        '/': function() {React.renderComponent(<Home />, routed);},
        '/register': function() {React.renderComponent(<Register /> , routed);},
        '/search': function() {React.renderComponent(<Search /> , routed);},
        '/title/(.+)': function(url) {
            React.renderComponent(<Title url={url} /> , routed);
        }
    };
    var routerHandler = new Router(routes);
    routerHandler.init('/');
});
