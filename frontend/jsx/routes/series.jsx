/** @jsx React.DOM */
var RouteMixin = require('../mixins/route.jsx');
var Loading = require('../shared_components/loading.jsx');
var ChapterList = require('../shared_components/chapter_list.jsx');
var store = require('../store.js');

module.exports = React.createClass({
    mixins: [RouteMixin],
    pageTitle: function() {
        var info = this.state.info;
        if (info) {
            return info.name;
        }
        return 'Loading series info...';
    },


    getInitialState: function() {
        return {
            populating: false,
            info: null
        };
    },

    componentWillReceiveProps: function(nextProps) {
        if ((!this.state.populating && !this.state.populated) ||
           this.props.loggedIn !== nextProps.loggedIn) {
            this.populateInfo();
        }
    },

    componentDidMount: function() {
        if (!this.state.populating && !this.state.populated) {
            this.populateInfo();
        }
    },

    populateInfo: function() {
        this.setState({populating: true});

        var cachedData = store.get('series_' + this.props.url);
        if (cachedData !== null) {
            this.setState({
                info: cachedData,
                populated: true,
                populating: false
            });
            return;
        }

        url = '/api/series?url=' + encodeURIComponent(this.props.url);
        url += '&chapter_limit=-1';

        var self = this;
        this.props.ajax({
            url: url,
            dataType: 'json',
            method: 'GET',
            success: function(data) {
                data.url = self.props.url;
                store.set('series_' + self.props.url, data);
                self.setState({
                    info: data,
                    populated: true
                });
            },
            complete: function() {
                self.setState({populating: false});
            }
        });
    },

    renderBookmarkBtn: function() {
        var info = this.state.info;
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
                    <button className="btn btn-success" onClick={this.bookmark}>
                        <i className='fa fa-star'></i> Bookmark
                    </button>
                );
            }
        }
        return bookmarkBtn;
    },

    bookmark: function() {
        var self = this;
        this.props.ajax({
            url: '/api/series-bookmark',
            method: 'POST',
            data: JSON.stringify({
                url: self.state.info.url,
                action: 'add'
            }),
            success: function() {
                info = self.state.info;
                info.is_bookmarked = true;
                self.setState({info: info});
                store.set('series_' + self.props.url, info);
            }
        });
    },

    render: function() {
        var body;

        if (this.state.populating) {
            body = <Loading />;

        } else if (this.state.populated) {
            var info = this.state.info;
            var tags = info.tags.join(', ');
            var desc = info.description.map(function(paragraph) {
                return <p>{paragraph}</p>;
            });
            body = (
                <div className="series-info">
                    <div className="row">

                        <div className="col-md-3">
                            <a className="thumbnail">
                                <img src={info.thumb_url} alt="thumbnail" />
                            </a>
                        </div>

                        <div className="col-md-9">
                            <h2 className="series-name">
                                {info.name} {this.renderBookmarkBtn()}
                            </h2>
                            <ul>
                                <li><a href={info.url}>Original link</a></li>
                                <li><strong>Status:</strong> {info.status}</li>
                                <li><strong>Tags:</strong> {tags}</li>
                                <li><strong>Description:</strong> {desc}</li>
                            </ul>
                        </div>
                    </div>

                    <hr />
                    <ChapterList chapters={info.chapters} />
                </div>
            );

        } else {
            body = 'Series info not fetched. Try again.';
        }

        return (
            <div className='series-container container'>
                {body}
            </div>
        );
    }
});
