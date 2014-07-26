/** @jsx React.DOM */
var RouteMixin = require('../mixins/route.jsx');
var TitleInfo = require('../shared_components/title_info.jsx');

var Title = React.createClass({
    mixins: [RouteMixin],
    pageTitle: function() {
        return 'Title Info';
    },

    render: function() {
        return (
            <TitleInfo loggedIn={this.props.loggedIn}
                ajax={this.props.ajax} url={decodeURIComponent(this.props.url)} />
        );
    }
});
