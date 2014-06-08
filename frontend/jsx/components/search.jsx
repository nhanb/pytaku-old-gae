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

var Search = React.createClass({
    getInitialState: function() {
        return {
            query: '',
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

        console.log(query);
        return false;
    },

    css: {textAlign: 'center'},
    btnCss: {margin: '10px', align: 'auto'},

    render: function(e) {
        return (
            <div>
                <form className="form-horizontal" role="form" style={this.css}
                    onSubmit={this.handleSubmit}>

                    <input className="form-control" type="text" ref="queryInput"
                        placeholder="Enter manga title" autoFocus="autofocus" />

                    <button className="btn btn-primary" style={this.btnCss}>
                        <i className="fa fa-search fa-lg"></i> Search
                    </button>

                </form>

                <TitleList items={this.state.items} />
            </div>
        )
    }
});
