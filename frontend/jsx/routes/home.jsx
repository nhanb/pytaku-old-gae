/** @jsx React.DOM */
var RouteMixin = require('../mixins/route.jsx');

module.exports = React.createClass({
    mixins: [RouteMixin],
    render: function() {
        return (
            <div className="container">
                <h2>Welcome to Pytaku!</h2>
            </div>
        );
    }
});
