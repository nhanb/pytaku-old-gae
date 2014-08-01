var RouteMixin = require('../mixins/route.jsx');
var Loading = require('../shared_components/loading.jsx');

module.exports = React.createClass({
    mixins: [RouteMixin],
    pageTitle: 'My chapter bookmarks',

    getInitialState: function() {
        return {
            chapters: [],
            loading: false,
        };
    },

    componentDidMount: function() {
        if (!this.props.loggedIn) {
            return;
        }
        var self = this;
        this.setState({loading: true});
        this.props.ajax({
            url: '/api/bookmarks',
            success: function(data) {
                self.setState({
                    chapters: data,
                });
            },
            error: function(data) {
                self.setState({errMsg: data.responseJSON.msg});
            },
            complete: function() {
                self.setState({loading: false});
            }
        });
    },

    renderChapter: function(chapter) {
        var href = '/#/chapter/' + encodeURIComponent(chapter.url);
        var titleHref = '/#/title/' + encodeURIComponent(chapter.title_url);
        return (
            <li className="list-group-item" key={chapter.url}>
                <a href={href}>{chapter.name}</a>
                <div className="btn-group pull-right">
                    <a href={href} className="btn btn-default">View</a>
                    <a href={titleHref} className="btn btn-default">Go to title</a>
                    <button type="button" className="btn btn-danger">Remove</button>
                </div>
                <div className="clearfix"></div>
            </li>
        );
    },

    render: function() {
        var content;

        // Gatekeeper. Duh!
        if (!this.props.loggedIn) {
            content = (
                <div className="alert alert-danger" role="alert">
                    This feature requires <a href="/#/login">logging in</a>.
                </div>
            );

        // Simple spinning loading icon
        } else if (this.state.loading === true) {
            content = <Loading />;

        // Finished loading but there's an error
        } else if (this.state.errMsg) {
            content = (
                <div className="alert alert-danger" role="alert">
                    {this.state.errMsg}
                </div>
            );

        // No error but user has nothing in bookmark list yet
        } else if (this.state.chapters.length === 0) {
            content = (
                <div className="alert alert-warning" role="alert">
                    You have nothing in your bookmark list yet :)
                </div>
            );

        // Everything worked! Let's render some useful data:
        } else {
            var chapters = this.state.chapters.map(this.renderChapter);
            content = (
                <div className="panel panel-default bookmarks-container">
                    <div className="panel-heading">Bookmarked chapters</div>
                    <ul className="list-group">
                        {chapters}
                    </ul>
                </div>
            );
        }

        return (
            <div className="container">
                {content}
            </div>
        );
    }
});
