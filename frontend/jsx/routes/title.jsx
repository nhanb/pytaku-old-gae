/** @jsx React.DOM */
var RouteMixin = require('../mixins/route.jsx');
var TitleInfo = require('../shared_components/title_info.jsx');

module.exports = React.createClass({
    mixins: [RouteMixin],
    pageTitle: function() {
        return this.refs.titleInfo.state.info.name; // yikes!
    },

    render: function() {
        var rawUrl = decodeURIComponent(this.props.url);
        return (
            <TitleInfo ref="titleInfo" loggedIn={this.props.loggedIn}
                ajax={this.props.ajax} url={rawUrl} />
        );
    }
});
