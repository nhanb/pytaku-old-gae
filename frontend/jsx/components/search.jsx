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
    className: function(searching) {
        var common = 'fa fa-lg';
        if (searching) {
            common += 'fa-spinner fa-spin';
        } else {
            common += 'fa-search';
        }
        return common;
    },

    render: function() {
        return (
            <button className="btn btn-primary" style={this.css}>
                <i className={this.className(this.props.searching)}></i> Search
            </button>
        );
    }
});

var Search = React.createClass({
    getInitialState: function() {
        return {
            query: '',
            searching: false,
            items: [
                {name: 'foo', url: '#', site: 'kissmanga'},
                {name: 'foo2', url: '#', site: 'batoto'}
            ]
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

        return false;
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
