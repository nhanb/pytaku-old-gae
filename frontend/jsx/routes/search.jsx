/** @jsx React.DOM */
var RouteMixin = require('../mixins/route.jsx');
var TitleInfo = require('../shared_components/title_info.jsx');
var store = require('../store.js');

var TitleList = React.createClass({
    css: {
        maxWidth: '800px',
        margin: '10px auto'
    },

    createTitle: function(item, id) {
        // Assign unique key to make sure outdated Title components are
        // destroyed instead of reused - http://fb.me/react-warning-keys
        var key = item.url;
        var href = '/#/title/' + encodeURIComponent(item.url);
        return (
            <a className="list-group-item" key={key} href={href}>
                {item.name}
                <span className="badge pull-right">{item.site}</span>
            </a>
        );
    },

    render: function() {
        return (
            <div className="list-group" style={this.css}>
                {this.props.items.map(this.createTitle)}
            </div>
        );
    }
});

var SearchButton = React.createClass({
    css: {margin: '10px', align: 'auto'},

    className: function() {
        var common = 'fa fa-lg ';
        if (this.props.searching) {
            common += 'fa-spinner fa-spin';
        } else {
            common += 'fa-search';
        }
        return common;
    },

    text: function() {
        if (this.props.searching) return 'Searching...';
        else return 'Search';
    },

    render: function() {
        return (
            <button className="btn btn-primary" style={this.css}>
                <i className={this.className()}></i> {this.text()}
            </button>
        );
    }
});

module.exports = React.createClass({
    mixins: [RouteMixin],
    pageTitle: function() {
        var query = this.props.query;
        if (query) {
            return query + ' - Manga title search';
        } else {
            return 'Search manga title';
        }
    },

    getInitialState: function() {
        return {
            searching: false,
            items: []
        };
    },

    componentDidMount: function() {
        if (this.props.query) {
            searching = true;
            this.search(this.props.query);
        }
    },

    componentWillReceiveProps: function(nextProps) {
        var searching = false;
        if (nextProps.query) {
            this.search(nextProps.query);
        }
    },

    handleSubmit: function(e) {
        var query = this.refs.queryInput.state.value;
        window.location.href = '/#/search/' + query;
        return false; // So that browser won't submit an old-fashioned POST
    },

    search: function(query) {
        if (!query || query.trim().length < 2 ||
            (this.state && this.state.searching)) {
            return false;
        }
        this.setState({searching: true});
        query = query.trim();

        var cachedData = store.get('search_' + query);
        if (cachedData !== null) {
            this.setState({
                items: cachedData,
                searching: false
            });
            return;
        }

        var self = this;
        $.ajax({
            url: '/api/search?keyword=' + encodeURIComponent(query),
            dataType: 'json',
            method: 'GET',
            success: function(data) {
                store.set('search_' + query, data);
                self.setState({items: data});
            },
            complete: function() {
                self.setState({searching: false});
            }
        });
    },

    css: {textAlign: 'center'},

    render: function(e) {
        return (
            <div>
                <form className="form-horizontal" role="form" style={this.css}
                    onSubmit={this.handleSubmit}>

                    <input className="form-control" type="text" ref="queryInput"
                        placeholder="Enter manga title" autoFocus="autofocus" />

                    <SearchButton searching={this.state.searching} />
                </form>

                <TitleList items={this.state.items}
                    loggedIn={this.props.loggedIn}
                    ajax={this.props.ajax} />
            </div>);
    }
});
