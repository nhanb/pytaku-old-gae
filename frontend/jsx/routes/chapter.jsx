/** @jsx React.DOM */
var RouteMixin = require('../mixins/route.jsx');
var Loading = require('../shared_components/loading.jsx');

module.exports = React.createClass({
    mixins: [RouteMixin],
    pageTitle: function() {
        return this.state.name;
    },
    render: function() {
        var pages = this.state.pageUrls.map(function(url) {
            return (
                <img className="page-img" key={url} src={url} />
            );
        });

        var name = this.state.name;
        var fetching = this.state.fetching;
        var next = this.state.next_url;
        var prev = this.state.prev_url;

        return (
            <div className="chapter-container">
                <h2 className="chapter-name">{name}</h2>
                <ChapterNavs prev={prev} next={next} />
                <Loading loading={fetching} />
                {pages}
                <ChapterNavs prev={prev} next={next} />
            </div>
        );
    },

    componentWillReceiveProps: function(nextProps) {
        this.fetchPages(nextProps.url);
    },

    getInitialState: function() {
        this.fetchPages(this.props.url);
        return {
            pageUrls: [],
            name: '',
            next_url: null,
            prev_url: null,
            fetching: true,
        };
    },

    fetchPages: function(url) {
        this.setState({
            fetching: true,
            pageUrls: [], // So that old pages disappear while fetching new
        });
        var self = this;
        $.ajax({
            url: '/api/chapter?url=' + url,
            dataType: 'json',
            method: 'GET',
            success: function(data) {
                var next_url = data.next_chapter_url;
                var prev_url = data.prev_chapter_url;
                if (next_url !== null) {
                    next_url = '/#/chapter/' + encodeURIComponent(next_url);
                }
                if (prev_url !== null) {
                    prev_url = '/#/chapter/' + encodeURIComponent(prev_url);
                }
                self.setState({
                    pageUrls: data.pages,
                    name: data.name,
                    next_url: next_url,
                    prev_url: prev_url,
                });
            },
            complete: function() {
                self.setState({fetching: false});
            }
        });
    },

});

var ChapterNavs = React.createClass({
    render: function() {
        var prevBtn = '';
        var nextBtn = '';

        if (this.props.prev !== null) {
            prevBtn =(
                <a href={this.props.prev} className="btn btn-success pull-left">
                    <i className="fa fa-lg fa-angle-double-left"></i> Prev
                </a>
            );
        }

        if (this.props.next !== null) {
            nextBtn =(
                <a href={this.props.next} className="btn btn-success pull-right">
                    Next <i className="fa fa-lg fa-angle-double-right"></i>
                </a>
            );
        }

        return (
            <div className="chapter-navs clearfix">
                {prevBtn}{nextBtn}
            </div>
        );
    }
});
