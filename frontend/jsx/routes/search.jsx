/** @jsx React.DOM */
var RouteMixin = require('../mixins/route.jsx');
var store = require('../store.js');
var echo = require('../language.jsx').echo;
var Alert = require('../shared_components/alert.jsx');

var SeriesList = React.createClass({
    css: {
        maxWidth: '800px',
        margin: '10px auto'
    },

    createSeries: function(item, id) {
        // Assign unique key to make sure outdated Series components are
        // destroyed instead of reused - http://fb.me/react-warning-keys
        var key = item.url;
        var href = '/series/' + encodeURIComponent(item.url);
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
            return this.props.msg;
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
            return echo('search_title');
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
        var type = this.props.type;
        var newRoute = '/search/' + type + '/' + encodeURIComponent(query);
        this.props.router.setRoute(newRoute);
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

        var cachedData = store.get('search_' + this.props.type + '_' + query);
        if (cachedData !== null) {
            this.setState({
                items: cachedData,
                searching: false
            });
            return;
        }

        var self = this;
        $.ajax({
            url: '/api/search?type=' + self.props.type + '&keyword=' + encodeURIComponent(query),
            dataType: 'json',
            method: 'GET',
            success: function(data) {
                store.set('search_' + query, data);
                self.setState({items: data});
            },
            error: function(data) {
                self.setState({
                    errorMsg: data.responseJSON.msg
                });
            },
            complete: function() {
                self.setState({searching: false});
            }
        });
    },

    css: {textAlign: 'center'},

    render: function(e) {
        var placeholder, searchBtnMsg;

        if (this.props.type === 'name') {
            placeholder = echo('enter_manga_title');
            searchBtnMsg = echo('search_manga');

        } else if (this.props.type === 'author') {
            placeholder = echo('enter_author_name');
            searchBtnMsg = echo('search_author');
        }

        return (
            <div>
                <Alert msg={echo(this.state.errorMsg)} />

                <form className="form-horizontal center-form" role="form" style={this.css}
                    onSubmit={this.handleSubmit}>

                    <input className="form-control" type="text" ref="queryInput"
                        placeholder={placeholder} autoFocus="autofocus" />

                    <SearchButton searching={this.state.searching} msg={searchBtnMsg}/>
                </form>

                <SeriesList items={this.state.items}
                    loggedIn={this.props.loggedIn}
                    ajax={this.props.ajax} />
            </div>);
    }
});
