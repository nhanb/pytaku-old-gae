/** @jsx React.DOM */
var RouteMixin = require('../mixins/route.jsx');
var Loading = require('../shared_components/loading.jsx');
var store = require('../store.js');

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
        };
    },

    fetchPages: function(url) {
        var newState = this.state;
        newState.info.pages = [];
        newState.fetching = true;
        this.setState(newState);

        cachedData = store.get('chapter_' + decodeURIComponent(url));
        if (cachedData !== null) {
            this.updateChapterData(cachedData);
            return;
        }

        var self = this;
        this.props.ajax({
            url: '/api/chapter?url=' + url,
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

        var info = this.props.info;
        var prev = info.prev_chapter_url;
        var next = info.next_chapter_url;

        if (prev !== null) {
            prev = '/#/chapter/' + encodeURIComponent(prev);
            prevBtn =(
                <a href={prev} className="btn btn-success pull-left">
                    <i className="fa fa-lg fa-angle-double-left"></i> Prev
                </a>
            );
        }

        if (next !== null) {
            next = '/#/chapter/' + encodeURIComponent(next);
            nextBtn =(
                <a href={prev} className="btn btn-success pull-right">
                    Next <i className="fa fa-lg fa-angle-double-right"></i>
                </a>
            );
        }

        var bookmarkBtn = this.renderBookmarkBtn();

        return (
            <div className="chapter-navs clearfix">
                {prevBtn} {bookmarkBtn} {nextBtn}
            </div>
        );
    },

    renderBookmarkBtn: function() {
        var info = this.props.info;
        var bookmarkBtn = '';
        if (info.hasOwnProperty('is_bookmarked')) {
            if (info.is_bookmarked) {
                bookmarkBtn = (
                    <button className="btn btn-success" disabled="disabled">
                        <i className='fa fa-lg fa-check-circle'></i> Bookmarked
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
        var self = this;
        this.props.ajax({
            url: '/api/bookmarks',
            method: 'POST',
            data: JSON.stringify({
                url: self.props.info.url,
                action: 'add'
            }),
            success: function() {
                info = self.props.info;
                info.is_bookmarked = true;
                var key = 'chapter_' + info.url;
                console.log(key);
                console.log(store.get(key));
                store.set('chapter_' + info.url, info);
                console.log(store.get(key));
                self.props.setState({info: info});
            }
        });
    },
});
