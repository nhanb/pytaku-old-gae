/** @jsx React.DOM */
var TitleList = React.createClass({
    css: {
        maxWidth: '800px',
        margin: '10px auto'
    },

    createItem: function(item) {
        return (
            <a href={item.url} className="list-group-item">
                <span className="badge">{item.site}</span>
                {item.name}
            </a>
        );
    },

    render: function() {
        return (
            <div className="list-group" style={this.css}>
                {this.props.items.map(this.createItem)}
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

var Search = React.createClass({
    getInitialState: function() {
        return {
            query: '',
            searching: false,
            items: []
        }
    },

    handleSubmit: function(e) {
        var query = this.refs.queryInput.state.value;
        if (!query || query.length < 2) {
            return false;
        }

        this.setState({searching: true});
        var self = this;
        $.ajax({
            url: '/api/search?keyword=' + encodeURIComponent(query),
            dataType: 'json',
            method: 'GET',
            success: function(data) {
                self.setState({items: data});
            },
            complete: function() {
                self.setState({searching: false});
            }
        });

        return false; // So that browser won't submit an old-fashioned POST
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

                <TitleList items={this.state.items} />
            </div>
        )
    }
});
