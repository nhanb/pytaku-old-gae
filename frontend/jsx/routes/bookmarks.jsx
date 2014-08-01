var RouteMixin = require('../mixins/route.jsx');
var Loading = require('../shared_components/loading.jsx');
var store = require('../store.js');

var BookmarkedChapter = React.createClass({
    getInitialState: function() {
        return {removing: false};
    },

    removeBookmark: function() {
        this.setState({removing: true});
        var chapter = this.props.chapter;
        var self = this;
        this.props.ajax({
            url: '/api/bookmarks',
            method: 'POST',
            data: JSON.stringify({
                url: chapter.url,
                action: 'remove'
            }),
            success: function() {
                // Update cache for that chapter
                var cachedChapter = store.get('chapter_' + chapter.url);
                if (cachedChapter) {
                    cachedChapter.is_bookmarked = false;
                    store.set('chapter_' + chapter.url, cachedChapter);
                }
                self.props.remove(chapter);
            },
            error: function(resp) {
                self.setState({removing: false});
            }
        });
    },

    render: function() {
        var chapter = this.props.chapter;
        var href = '/#/chapter/' + encodeURIComponent(chapter.url);
        var titleHref = '/#/title/' + encodeURIComponent(chapter.title_url);

        var removeBtn;
        if (this.state.removing === true) {
            removeBtn = (
                <button type="button" className="btn btn-danger"
                    disabled="disabled">
                    <i className="fa fa-spinner fa-spin"></i> Removing...
                </button>
            );
        } else {
            removeBtn = (
                <button type="button" className="btn btn-danger"
                onClick={this.removeBookmark}>Remove</button>
            );
        }

        return (
            <li className="list-group-item" key={chapter.url}>
                <a href={href}>{chapter.name}</a>
                <div className="btn-group pull-right">
                    <a href={href} className="btn btn-default">View</a>
                    <a href={titleHref} className="btn btn-default">Go to title</a>
                    {removeBtn}
                </div>
                <div className="clearfix"></div>
            </li>
        );
    }
});

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

    removeChapter: function(chapter) {
        var chapters = this.state.chapters;
        var i = chapters.indexOf(chapter);
        if (i > -1) {
            chapters.splice(i, 1);
            this.setState({chapters: chapters});
        }
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
            var removeChapter = this.removeChapter;
            var self =this;
            var chapters = this.state.chapters.map(function(chapter) {
                return <BookmarkedChapter chapter={chapter} key={chapter.url}
                    ajax={self.props.ajax} remove={removeChapter} />;
            });
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
