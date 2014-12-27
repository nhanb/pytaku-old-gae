/** @jsx React.DOM */
var RouteMixin = require('../mixins/route.jsx');
var Loading = require('../shared_components/loading.jsx');
var Alert = require('../shared_components/alert.jsx');
var store = require('../store.js');
var echo = require('../language.jsx').echo;

var BookmarkButton = React.createClass({
    getInitialState: function() {
        return {processing: false};
    },

    render: function() {
        var info = this.props.info;
        var bookmarkBtn = <span></span>;

        if (info.hasOwnProperty('is_bookmarked')) {

            if (this.state && this.state.processing === true) {
                bookmarkBtn = (
                    <button className="btn btn-danger" disabled="disabled">
                        <i className='fa fa-lg fa-spinner fa-spin'></i> {echo('processing')}...
                    </button>
                );

            } else if (info.is_bookmarked) {
                bookmarkBtn = (
                    <button className="btn btn-danger" onClick={this.removeBookmark}>
                        <i className='fa fa-lg fa-ban'></i> {echo('unbookmark')}
                    </button>
                );

            } else {
                bookmarkBtn = (
                    <button className="btn btn-success" onClick={this.addBookmark}>
                        <i className='fa fa-bookmark'></i> {echo('bookmark')}
                    </button>
                );
            }
        }
        return bookmarkBtn;
    },

    addBookmark: function() {
        this.bookmark('add');
    },

    removeBookmark: function() {
        this.bookmark('remove');
    },

    bookmark: function(action) {
        this.setState({
            processing: true
        });
        var self = this;
        this.props.ajax({
            url: '/api/chapter-bookmark',
            method: 'POST',
            data: JSON.stringify({
                url: self.props.info.url,
                action: action
            }),

            success: function() {
                info = self.props.info;
                if (action == 'add') {
                    info.is_bookmarked = true;
                } else {
                    info.is_bookmarked = false;
                }
                var key = 'chapter_' + info.url;
                store.set('chapter_' + info.url, info);
                self.props.setState({info: info});
            },

            complete: function() {
                self.setState({
                    processing: false
                });
            }
        });
    },
});

module.exports = React.createClass({
    mixins: [RouteMixin],
    pageTitle: function() {
        if (!this.state.info.name) {
            return echo('loading_chapter_info');
        }
        return this.state.info.name + ' - ' + this.state.info.series_name ;
    },

    render: function() {
        var info = this.state.info;
        var name = info.name;
        var next = info.next_chapter_url;
        var prev = info.prev_chapter_url;
        var fetching = this.state.fetching;

        var pages = info.pages.map(function(url, index) {
            return (
                <img className="page-img" key={url + index} src={url} />
            );
        });

        var setState = this.setState.bind(this);

        var body;
        if (this.state.errorMsg) {
            return (
                <div className="chapter-container">
                    <Alert msg={echo(this.state.errorMsg)} />
                </div>
            );
        }

        return (
            <div className="chapter-container">
                <h2 className="chapter-name">{name}</h2>
                <div>
                    <ActionBar info={info} ajax={this.props.ajax} setState={setState} />
                    <Loading loading={fetching} />
                    {pages}
                    <ActionBar info={info} ajax={this.props.ajax} setState={setState} />
                </div>
            </div>
        );
    },

    componentWillReceiveProps: function(nextProps) {
        this.fetchPages(nextProps.url);
    },

    componentDidMount: function() {
        this.fetchPages(this.props.url);
    },

    getInitialState: function() {
        return {
            info: {
                pages: [],
                name: '',
                series_name: '',
                next_chapter_url: null,
                prev_chapter_url: null,
            },
            fetching: true,
            processingBookmark: false,
        };
    },

    fetchPages: function(url) {
        var newState = this.state;
        newState.info.pages = [];
        newState.fetching = true;
        this.setState(newState);

        cachedData = store.get('chapter_' + url);
        if (cachedData !== null) {
            this.updateChapterData(cachedData);
            this.startProgressTimer();
            return;
        }

        var self = this;
        this.props.ajax({
            url: '/api/chapter?url=' + encodeURIComponent(url),
            dataType: 'json',
            method: 'GET',
            success: function(data) {
                store.set('chapter_' + url, data);
                self.updateChapterData(data);
                self.startProgressTimer();
            },
            error: function(data) {
                self.setState({
                    errorMsg: data.responseJSON.msg
                });
            },
            complete: function() {
                self.setState({fetching: false});
            }
        });
    },

    updateChapterData: function(data) {
        this.setState({
            info: data,
            fetching: false,
        });
    },

    startProgressTimer: function() {
        if (!this.props.loggedIn || this.state.info.progress === 'finished') {
            return;
        }
        var self = this;
        var initialUrl = window.location.href;

        var delay = 4000;  // TODO: make this configurable
        setTimeout(function() {
            // Make sure user is still reading this page before doing anything
            if (initialUrl === window.location.href) {
                self.setProgress('reading');
                self.setFinishedOnReachBottom();
            }
        }, delay);
    },

    _finishedOnReachBottomIsSet: false,
    setFinishedOnReachBottom: function() {
        // As the name suggests: set chapter progress as "finished" when user
        // scrolls to bottom of page
        if (this._finishedOnReachBottomIsSet) {
            return;
        }
        var self = this;
        window.onscroll = function(ev) {
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
                self.setProgress('finished');
            }
        };
        this._finishedOnReachBottomIsSet = true;
    },

    setProgress: function(progress) {
        if (this.state.info.progress === progress) {
            return;
        }
        var url = this.props.url;
        var self = this;
        this.props.ajax({
            url: '/api/chapter-progress',
            data: JSON.stringify({
                url: url,
                progress: progress,
            }),
            dataType: 'json',
            method: 'POST',
            success: function(data) {
                var info = self.state.info;

                // Update existing cached chapter info
                cachedChapter = info;
                cachedChapter.progress = progress;
                store.set('chapter_' + url, cachedChapter);
                self.updateChapterData(cachedChapter);

                // Update in series route too
                // XXX: it's reaaaally wasteful to load and rewrite the whole
                // series' info just to update a chapter... but it's easier
                // this way so...
                cachedSeries = store.get('series_' + info.series_url);
                if (cachedSeries) {
                    for (var i=0; i < cachedSeries.chapters.length; i++) {
                        var chap = cachedSeries.chapters[i];
                        if (chap.url == self.props.url) {
                            chap.progress = progress;
                            break;
                        }
                    }
                    store.set('series_' + info.series_url, cachedSeries);
                }
            },
            error: function(err) {
                console.log('error while setting progress:', err);
            }
        })
    }


});

var ActionBar = React.createClass({
    render: function() {
        var prevBtn = '';
        var nextBtn = '';
        var seriesBtn = '';

        var info = this.props.info;
        var prev = info.prev_chapter_url;
        var next = info.next_chapter_url;
        var series = info.series_url;

        if (prev !== null) {
            prev = '/#/chapter/' + encodeURIComponent(prev);
            prevBtn =(
                <a href={prev} className="btn btn-primary">
                    <i className="fa fa-lg fa-angle-double-left"></i> {echo('prev')}
                </a>
            );
        }

        if (next !== null) {
            next = '/#/chapter/' + encodeURIComponent(next);
            nextBtn =(
                <a href={next} className="btn btn-primary">
                    {echo('next')} <i className="fa fa-lg fa-angle-double-right"></i>
                </a>
            );
        }

        series = '/#/series/' + encodeURIComponent(series);
        seriesBtn =(
            <a href={series} className="btn btn-info">
                <i className="fa fa-lg fa-angle-double-up"></i> {echo('chapter_list')}
            </a>
        );

        var bookmarkBtn = <BookmarkButton info={info} ajax={this.props.ajax}
            setState={this.props.setState} />;


        return (
            <div className="chapter-navs  btn-group">
                {prevBtn} {seriesBtn} {bookmarkBtn} {nextBtn}
            </div>
        );
    },
});
