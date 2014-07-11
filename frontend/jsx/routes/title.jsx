/** @jsx React.DOM */
var Title = React.createClass({
    mixins: [RouteMixin],
    pageTitle: function() {
        return 'Title Info';
    },

    render: function() {
        return (
            <TitleInfo loggedIn={this.props.loggedIn}
                authedAjax={this.props.authedAjax} url={this.props.url} />
        );
    }
});
