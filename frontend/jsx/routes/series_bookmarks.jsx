/** @jsx React.DOM */
var RouteMixin = require('../mixins/route.jsx');
var Loading = require('../shared_components/loading.jsx');
var ChapterList = require('../shared_components/chapter_list.jsx');
var Alert = require('../shared_components/alert.jsx');
var store = require('../store.js');
var echo = require('../languages/index.js').echo;

var getCachedSeries = function(url) {
    return store.get('bookmarked_series_' + url);
};

var setCachedSeries = function(url, data) {
    return store.set('bookmarked_series_' + url, data);
}

// Each item represents a series, displaying its name and latest chapters
var SeriesItem = React.createClass({
    getInitialState: function() {
        return {
            chapters: [],
            loading: false,
            removing: false,
        };
    },

    removeBookmark: function() {
        this.setState({removing: true});
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
                self.props.remove(self.props.series);
            },
            error: function() {
                self.setState({removing: false});
            }
        });
    },

    componentDidMount: function() {
        this.setState({loading: true});

        url = '/api/series?url=' + encodeURIComponent(this.props.url);
        url += '&only_unread=1';

        var self = this;

        var cached = getCachedSeries(this.props.url);
        if (cached !== null) {
            self.setState({
                chapters: cached.chapters,
                loading: false,
            });
            return;
        }

        this.props.ajax({
            url: url,
            success: function(data) {
                self.setState({chapters: data.chapters});
                setCachedSeries(self.props.url, data);
            },
            error: function(data) {
                self.setState({errorMsg: data.responseJSON.msg});
            },
            complete: function(data) {
                self.setState({loading: false});
            }
        });
    },

    renderRemoveBtn: function() {
        var removeBtnCss = {
            'width': '100%',
            'marginBottom': '15px',
        };

        if (this.state.removing === true) {
            return (
                <button type="button" className="btn btn-sm btn-danger"
                    style={removeBtnCss} disabled="disabled">
                    <i className="fa fa-spinner fa-spin"></i> {echo('removing')}...
                </button>
            );
        } else {
            return <button onClick={this.removeBookmark} style={removeBtnCss}
                className="btn btn-sm btn-danger">{echo('remove')}</button>;
        }
    },

    renderThumbnail: function() {
        var seriesHref = '/series/' + encodeURIComponent(this.props.url);

        return (
            <div className="col-md-2">
                <a className="thumbnail" href={seriesHref}>
                    <img src={this.props.thumb} alt="thumbnail" />
                </a>
                {this.renderRemoveBtn()}
            </div>
        );
    },

    renderEmpty: function() {
        var seriesHref = '/series/' + encodeURIComponent(this.props.url);
        return (
            <div className="row">

                {this.renderThumbnail()}

                <div className="col-md-10 alert alert-primary">
                    <p>
                        {echo('no_new_chapters')}.
                    </p>
                </div>
            </div>
        );
    },

    render: function() {
        var chapters = this.state.chapters;

        if (chapters.length === 0 && !this.state.loading) {
            return this.renderEmpty();
        }

        var removeBtn = this.renderRemoveBtn();
        var thumbnail = this.renderThumbnail();

        var chapterArray;
        if (!this.state.loading) {
            if (this.state.errorMsg) {
                var msg = echo('load_series_failed') + ': ' + echo(this.state.errorMsg);
                chapterArray = <Alert msg={msg} />;
            } else {
                chapterArray = <ChapterList chapters={chapters} />;
            }
        } else {
            chapterArray = <Loading />;
        }

        return (
            <div className="row">

                {thumbnail}

                <div className="list-group col-md-10">
                    {chapterArray}
                </div>
            </div>
        );
    },

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

    removeSeries: function(s) {
        var series_list = this.state.series_list;
        var i = series_list.indexOf(s);
        if (i > -1) {
            series_list.splice(i, 1);
            this.setState({series_list: series_list});
        }
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
                    series={series}
                    thumb={series.thumb_url} remove={self.removeSeries}
                    ajax={self.props.ajax} key={series.url} />;
            });
        }

        return (
            <div className="container">
                {content}
            </div>
        );
    },

});

module.exports.getCachedSeries = getCachedSeries;
module.exports.setCachedSeries = setCachedSeries;
