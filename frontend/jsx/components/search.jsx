/** @jsx React.DOM */

var TitleInfo = React.createClass({
    renderChapter: function(chapter) {
        return (
            <a href={chapter.url} className="list-group-item">
                {chapter.name}
            </a>
        )
    },

    render: function() {
        var info = this.props.info;
        return (
            <div className="title-info">
                <div className="row">

                    <div className="col-md-4">
                        <a className="thumbnail">
                            <img src={info.thumb_url} alt="thumbnail" />
                        </a>
                    </div>

                    <div className="col-md-8">
                        <ul>
                            <li><strong>Tags:</strong></li>
                            <li><strong>Lorem ipsum</strong></li>
                        </ul>
                    </div>
                </div>

                <hr />
                <div className="list-group">
                    {info.chapters.map(this.renderChapter)}
                </div>
            </div>
        );
    }
});

var Title = React.createClass({
    render: function() {
        var item = this.props.item;
        var tagId = 'collapse' + this.props.id;
        var href = '#' + tagId;

        if (this.state.populated) {
            var titleInfo = <TitleInfo info={this.state.info}/>;
        } else {
            var titleInfo = "Fetching data...";
        }

        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h4 className="panel-title">
                        <a data-toggle="collapse" data-parent="#accordion"
                            href={href} onClick={this.populateInfo}>
                            {item.name}
                        </a>
                        <span className="badge pull-right">{item.site}</span>
                    </h4>
                </div>
                <div id={tagId} className="panel-collapse collapse">
                    <div className="panel-body">
                        {titleInfo}
                    </div>
                </div>
            </div>
        );
    },

    getInitialState: function() {
        return {
            populating: false,
            populated: false
        }
    },

    populateInfo: function() {
        if (this.populated) return;
        var item = this.props.item;
        this.setState({populating: true});

        var self = this;
        $.ajax({
            url: '/api/title?url=' + encodeURIComponent(item.url),
            dataType: 'json',
            method: 'GET',
            success: function(data) {
                self.setState({
                    info: data,
                    populated: true
                });
            },
            complete: function() {
                self.setState({populating: false});
            }
        });
    }
});

var TitleList = React.createClass({
    css: {
        maxWidth: '800px',
        margin: '10px auto'
    },

    createTitle: function(item, id) {
        // Assign unique key to make sure outdated Title components are
        // destroyed instead of reused - http://fb.me/react-warning-keys
        var key = item.url;
        return <Title item={item} id={id} key={key} />
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
