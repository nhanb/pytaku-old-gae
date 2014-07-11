/** @jsx React.DOM */
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
