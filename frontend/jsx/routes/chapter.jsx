/** @jsx React.DOM */
var RouteMixin = require('../mixins/route.jsx');
var Loading = require('../shared_components/loading.jsx');
var store = require('../store.js');

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
                        <i className='fa fa-lg fa-spinner fa-spin'></i> Processing...
                    </button>
                );

            } else if (info.is_bookmarked) {
                bookmarkBtn = (
                    <button className="btn btn-danger" onClick={this.removeBookmark}>
                        <i className='fa fa-lg fa-ban'></i> Unbookmark
                    </button>
                );

            } else {
                bookmarkBtn = (
                    <button className="btn btn-success" onClick={this.addBookmark}>
                        <i className='fa fa-bookmark'></i> Bookmark
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
            url: '/api/bookmarks',
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
        return this.state.info.name;
    },

    render: function() {
        var info = this.state.info;
        var name = info.name;
        var next = info.next_chapter_url;
        var prev = info.prev_chapter_url;
        var fetching = this.state.fetching;

        var pages = info.pages.map(function(url) {
            return (
                <img className="page-img" key={url} src={url} />
            );
        });

        var setState = this.setState.bind(this);

        return (
            <div className="chapter-container">
                <h2 className="chapter-name">{name}</h2>
                <ActionBar info={info} ajax={this.props.ajax} setState={setState} />
                <Loading loading={fetching} />
                {pages}
                <ActionBar info={info} ajax={this.props.ajax} setState={setState} />
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
            },
            error: function() {
                self.setState({fetching: false});
            }
        });
    },

    updateChapterData: function(data) {
        this.setState({
            info: data,
            fetching: false,
        });
    }

});

var ActionBar = React.createClass({
    render: function() {
        var prevBtn = '';
        var nextBtn = '';
        var titleBtn = '';

        var info = this.props.info;
        var prev = info.prev_chapter_url;
        var next = info.next_chapter_url;
        var title = info.title_url;

        if (prev !== null) {
            prev = '/#/chapter/' + encodeURIComponent(prev);
            prevBtn =(
                <a href={prev} className="btn btn-primary">
                    <i className="fa fa-lg fa-angle-double-left"></i> Prev
                </a>
            );
        }

        if (next !== null) {
            next = '/#/chapter/' + encodeURIComponent(next);
            nextBtn =(
                <a href={next} className="btn btn-primary">
                    Next <i className="fa fa-lg fa-angle-double-right"></i>
                </a>
            );
        }

        title = '/#/title/' + encodeURIComponent(title);
        titleBtn =(
            <a href={title} className="btn btn-info">
                <i className="fa fa-lg fa-angle-double-up"></i> Chapter list
            </a>
        );

        var bookmarkBtn = <BookmarkButton info={info} ajax={this.props.ajax}
            setState={this.props.setState} />;


        return (
            <div className="chapter-navs  btn-group">
                {prevBtn} {titleBtn} {bookmarkBtn} {nextBtn}
            </div>
        );
    },
});
