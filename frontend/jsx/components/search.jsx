/** @jsx React.DOM */

var Title = React.createClass({

    render: function() {
        var item = this.props.item;
        var tagId = 'collapse' + this.props.id;
        var href = '#' + tagId;

        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h4 className="panel-title">
                        <a data-toggle="collapse" data-parent="#accordion"
                            href={href}>
                            {item.name}
                        </a>
                        <span className="badge pull-right">{item.site}</span>
                    </h4>
                </div>
                <div id={tagId} className="panel-collapse collapse">
                    <div className="panel-body">
                        TO BE UPDATED
                    </div>
                </div>
            </div>
        );
    }
});

var TitleList = React.createClass({
    css: {
        maxWidth: '800px',
        margin: '10px auto'
    },

    createTitle: function(item, id) {
        return <Title item={item} id={id} />
    },

    render: function() {
        return (
            <div className="panel-group" id="accordion" style={this.css}>
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

var Search = React.createClass({
    getInitialState: function() {
        return {
            searching: false,
            items: []
        }
    },

    handleSubmit: function(e) {
        var query = this.refs.queryInput.state.value;
        if (!query || query.trim().length < 2) {
            return false;
        }
        query = query.trim();

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
