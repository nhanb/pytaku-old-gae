/** @jsx React.DOM */
var RouteMixin = require('../mixins/route.jsx');
var echo = require('../language.jsx').echo;

module.exports = React.createClass({
    mixins: [RouteMixin],
    pageTitle: echo('user_settings'),

    render: function() {
        return <h1>BLAH</h1>;
    }
});
