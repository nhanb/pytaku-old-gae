/** @jsx React.DOM */
var RouteMixin = require('../mixins/route.jsx');
var store = require('../store.js');
var echo = require('../language.jsx').echo;

var SeriesList = React.createClass({
    css: {
        maxWidth: '800px',
        margin: '10px auto'
    },

    createSeries: function(item, id) {
        // Assign unique key to make sure outdated Series components are
        // destroyed instead of reused - http://fb.me/react-warning-keys
        var key = item.url;
        var href = '/#/series/' + encodeURIComponent(item.url);
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
                {this.props.items.map(this.createSeries)}
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
        if (this.props.searching) {
            return echo('search_searching');
        } else {
            return echo('search_search');
        };
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
            return query + ' - ' + echo('search_title');
        } else {
            return 'Search manga series';
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
        window.location.href = '/#/search/' + encodeURIComponent(query);
        return false; // So that browser won't submit an old-fashioned POST
    },

    search: function(query) {
        this.refs.queryInput.setState({value: query});

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
                <form className="form-horizontal center-form" role="form" style={this.css}
                    onSubmit={this.handleSubmit}>

                    <input className="form-control" type="text" ref="queryInput"
                        placeholder={echo('enter_manga_title')} autoFocus="autofocus" />

                    <SearchButton searching={this.state.searching} />
                </form>

                <SeriesList items={this.state.items}
                    loggedIn={this.props.loggedIn}
                    ajax={this.props.ajax} />
            </div>);
    }
});
