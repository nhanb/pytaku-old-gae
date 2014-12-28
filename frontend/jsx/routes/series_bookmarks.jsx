/** @jsx React.DOM */
var RouteMixin = require('../mixins/route.jsx');
var Loading = require('../shared_components/loading.jsx');
var ChapterList = require('../shared_components/chapter_list.jsx');
var Alert = require('../shared_components/alert.jsx');
var store = require('../store.js');
var echo = require('../language.jsx').echo;

// Each item represents a series, displaying its name and latest chapters
var SeriesItem = React.createClass({
    getInitialState: function() {
        return {
            chapters: [],
            loading: false,
            removed: false,
        };
    },

    componentDidMount: function() {
        this.setState({loading: true});

        url = '/api/series?url=' + encodeURIComponent(this.props.url);
        url += '&chapter_limit=' + this.props.chapter_num;

        var self = this;
        this.props.ajax({
            url: url,
            success: function(data) {
                self.setState({chapters: data.chapters});
            },
            error: function(data) {
                self.setState({errorMsg: data.responseJSON.msg});
            },
            complete: function(data) {
                self.setState({loading: false});
            }
        });
    },

    render: function() {
        if (this.state.removed) {
            return <span></span>;
        }
        var returnVal;
        var chapters = this.state.chapters;
        var latestChapters = '';

        var removeBtnCss = {
            'width': '100%',
            'margin-bottom': '15px',
        };
        var removeBtn = <button onClick={this.remove} style={removeBtnCss}
            className="btn btn-sm btn-danger">{echo('remove')}</button>;

        var seriesHref = '/series/' + encodeURIComponent(this.props.url);


        var latest = chapters.slice(0, this.props.chapter_num);
        nameRowSpan = latest.length;

        var chapterArray;
        if (!this.state.loading) {
            if (this.state.errorMsg) {
                var msg = echo('load_series_failed') + ': ' + echo(this.state.errorMsg);
                chapterArray = <Alert msg={msg} />;
            } else {
                chapterArray = <ChapterList chapters={latest} />;
            }
        } else {
            chapterArray = <Loading />;
        }

        returnVal = (
            <div className="row">

                <div className="col-md-2">
                    <a className="thumbnail" href={seriesHref}>
                        <img src={this.props.thumb} alt="thumbnail" />
                    </a>
                        {removeBtn}
                </div>

                <div className="list-group col-md-10">
                    {chapterArray}
                </div>
            </div>
        );
        return returnVal;
    },

    remove: function() {
        var self = this;
        this.props.ajax({
            url: '/api/series-bookmark',
            method: 'POST',
            data: JSON.stringify({
                url: this.props.url,
                action: 'remove'
            }),
            success: function() {
                var cachedData = store.get('series_' + self.props.url);
                if (cachedData !== null) {
                    cachedData.is_bookmarked = false;
                    store.set('series_' + self.props.url, cachedData);
                }
                self.setState({removed: true});
            }
        });
    }
});

module.exports = React.createClass({
    mixins: [RouteMixin],
    pageTitle: echo('my_series_bookmarks'),

    getInitialState: function() {
        return {
            series_list: [],
            loading: false,
            errMsg: '',
        };
    },

    componentDidMount: function() {
        if (!this.props.loggedIn) {
            return;
        }
        var self = this;
        this.setState({loading: true});
        this.props.ajax({
            url: '/api/series-bookmark',
            success: function(data) {
                self.setState({
                    series_list: data,
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

    render: function() {
        var content;

        // Gatekeeper. Duh!
        if (!this.props.loggedIn) {
            content = (
                <div className="alert alert-danger" role="alert">
                    {echo('this_feature_requires_logging_in')}: <a href="/login">{echo('login_now')}</a>.
                </div>
            );

        // Simple spinning loading icon
        } else if (this.state.loading === true) {
            content = <Loading />;

        // Finished loading but there's an error
        } else if (this.state.errMsg) {
            content = <Alert msg={echo(this.state.errMsg)} />;

        // No error but user hasn't bookmarked any series yet
        } else if (this.state.series_list.length === 0) {
            content = (
                <div className="alert alert-warning" role="alert">
                    {echo('no_bookmarked_series_yet')}
                </div>
            );

        // Everything worked! Let's render some useful data:
        } else {
            var self = this;
            content = this.state.series_list.map(function(series) {
                return <SeriesItem url={series.url} name={series.name}
                    thumb={series.thumb_url}
                    ajax={self.props.ajax} key={series.url} chapter_num="6" />;
            });
        }

        return (
            <div className="container">
                {content}
            </div>
        );
    }
});
