/** @jsx React.DOM */
var RouteMixin = require('../mixins/route.jsx');
var Loading = require('../shared_components/loading.jsx');
var store = require('../store.js');

// Each item represents a title, displaying its name and latest chapters
var ReadListItem = React.createClass({
    getInitialState: function() {
        return {
            chapters: [],
            loading: false,
            removed: false,
        };
    },

    componentDidMount: function() {
        this.setState({loading: true});

        url = '/api/title?url=' + encodeURIComponent(this.props.url);
        url += '&chapter_limit=' + this.props.chapter_num;

        var self = this;
        this.props.ajax({
            url: url,
            success: function(data) {
                self.setState({chapters: data.chapters});
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
            className="btn btn-sm btn-danger">remove</button>;

        var titleHref = '/#/title/' + encodeURIComponent(this.props.url);
        var titleA = <a href={titleHref}>{this.props.name}</a>;


        var latest = chapters.slice(0, this.props.chapter_num);
        nameRowSpan = latest.length;

        var chapterArray;
        if (!this.state.loading) {
            chapterArray = latest.map(function(chapter) {
                var href = '/#/chapter/' + encodeURIComponent(chapter.url);
                return (
                    <a className="list-group-item" href={href}>
                        {chapter.name}
                    </a>
                );
            });
        } else {
            chapterArray = <Loading />;
        }

        returnVal = (
            <div className="row">

                <div className="col-md-2">
                    <a className="thumbnail" href={titleHref}>
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
            url: '/api/read-list',
            method: 'POST',
            data: JSON.stringify({
                url: this.props.url,
                action: 'remove'
            }),
            success: function() {
                var cachedData = store.get('title_' + self.props.url);
                if (cachedData !== null) {
                    cachedData.is_in_read_list = false;
                    store.set('title_' + self.props.url, cachedData);
                }
                self.setState({removed: true});
            }
        });
    }
});

module.exports = React.createClass({
    mixins: [RouteMixin],
    pageTitle: 'My manga read list',

    getInitialState: function() {
        return {
            titles: [],
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
            url: '/api/read-list',
            success: function(data) {
                self.setState({
                    titles: data,
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

        // No error but user has nothing in read list yet
        } else if (this.state.titles.length === 0) {
            content = (
                <div className="alert alert-warning" role="alert">
                    You have nothing in your read list yet :)
                </div>
            );

        // Everything worked! Let's render some useful data:
        } else {
            var self = this;
            content = this.state.titles.map(function(title) {
                return <ReadListItem url={title.url} name={title.name}
                    thumb={title.thumb_url}
                    ajax={self.props.ajax} key={title.url} chapter_num="6" />;
            });
        }

        return (
            <div className="container">
                {content}
            </div>
        );
    }
});
