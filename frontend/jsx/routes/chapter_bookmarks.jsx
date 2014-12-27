/** @jsx React.DOM */
var RouteMixin = require('../mixins/route.jsx');
var Loading = require('../shared_components/loading.jsx');
var Alert = require('../shared_components/alert.jsx');
var store = require('../store.js');
var echo = require('../language.jsx').echo;

var BookmarkedChapter = React.createClass({
    getInitialState: function() {
        return {removing: false};
    },

    removeBookmark: function() {
        this.setState({removing: true});
        var chapter = this.props.chapter;
        var self = this;
        this.props.ajax({
            url: '/api/chapter-bookmark',
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
        var seriesHref = '/#/series/' + encodeURIComponent(chapter.series_url);

        var removeBtn;
        if (this.state.removing === true) {
            removeBtn = (
                <button type="button" className="btn btn-danger pull-right"
                    disabled="disabled">
                    <i className="fa fa-spinner fa-spin"></i> Removing...
                </button>
            );
        } else {
            removeBtn = (
                <button type="button" className="btn btn-danger pull-right"
                onClick={this.removeBookmark}>{echo('remove')}</button>
            );
        }

        return (
            <li className="list-group-item" key={chapter.url}>
                <div className="btn-group">
                    <a href={seriesHref} className="btn btn-default">{chapter.series_name}</a>
                    <a href={href} className="btn btn-primary">{chapter.name}</a>
                </div>
                {removeBtn}
                <div className="clearfix"></div>
            </li>
        );
    }
});

module.exports = React.createClass({
    mixins: [RouteMixin],
    pageTitle: echo('my_chapter_bookmarks'),

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
            url: '/api/chapter-bookmark',
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
                    {echo('this_feature_requires_logging_in')}: <a href="/#/login">{echo('login_now')}</a>.
                </div>
            );

        // Simple spinning loading icon
        } else if (this.state.loading === true) {
            content = <Loading />;

        // Finished loading but there's an error
        } else if (this.state.errMsg) {
            content = <Alert msg={this.state.errMsg} />;

        // No error but user has nothing in bookmark list yet
        } else if (this.state.chapters.length === 0) {
            content = (
                <div className="alert alert-warning" role="alert">
                    {echo('no_bookmarked_chapter_yet')}
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
                    <div className="panel-heading">{echo('bookmarked_chapters')}</div>
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
