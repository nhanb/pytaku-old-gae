/** @jsx React.DOM */
$(document).ready(function() {

    var routes = {
        '/': function() {
            React.renderComponent(<Home /> , document.getElementById('route'));
        }
    };
    var routerHandler = new Router(routes);
    routerHandler.init('/');
});
