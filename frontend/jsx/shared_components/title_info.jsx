/** @jsx React.DOM */
var TitleInfo = React.createClass({

    getDefaultProps: function() {
        return {doPopulate: true};
    },

    getInitialState: function() {
        return {
            populating: false
        };
    },

    componentWillReceiveProps: function(nextProps) {
        if (nextProps.doPopulate && !this.state.populating) {
            this.populateInfo();
        }
    },

    componentDidMount: function() {
        if (this.props.doPopulate && !this.state.populating) {
            this.populateInfo();
        }
    },

    populateInfo: function() {
        this.setState({populating: true});
        var self = this;
        this.props.ajax({
            url: '/api/title?url=' + self.props.url,
            dataType: 'json',
            method: 'GET',
            success: function(data) {
                data.url = self.props.url;
                self.setState({
                    info: data,
                    populated: true
                });
            },
            complete: function() {
                self.setState({populating: false});
            }
        });
    },

    renderChapter: function(chapter) {
        var href = '/#/chapter/' + encodeURIComponent(chapter.url);
        return (
            <a href={href} className="list-group-item">
                {chapter.name}
            </a>
        );
    },

    renderReadListBtn: function() {
        var info = this.state.info;
        var readListBtn = '';
        if (info.hasOwnProperty('is_in_read_list')) {
            if (info.is_in_read_list) {
                readListBtn = (
                    <button className="btn btn-success" disabled="disabled">
                        <i className='fa fa-lg fa-check-circle'></i> In my read list
                    </button>
                );
            } else {
                readListBtn = (
                    <button className="btn btn-success" onClick={this.addToReadList}>
                        <i className='fa fa-star'></i> Add to read list
                    </button>
                );
            }
        }
        return readListBtn;
    },

    addToReadList: function() {
        var self = this;
        this.props.ajax({
            url: '/api/read-list',
            method: 'POST',
            data: JSON.stringify({url: self.state.info.url}),
            success: function() {
                info = self.state.info;
                info.is_in_read_list = true;
                self.setState({info: info});
            }
        });
    },

    render: function() {
        var body;

        if (this.state.populating) {
            body = <Loading />;

        } else if (this.state.populated) {
            var info = this.state.info;
            var permalink = '/#/title/' + info.url;

            body = (
                <div className="title-info">
                    <div className="row">

                        <div className="col-md-4">
                            <a className="thumbnail">
                                <img src={info.thumb_url} alt="thumbnail" />
                            </a>
                        </div>

                        <div className="col-md-8">
                            <h2 className="title-name">
                                {info.name} {this.renderReadListBtn()}
                            </h2>
                            <ul>
                                <li><a href={permalink}>permanent link</a></li>
                                <li><strong>more details to be implemented...</strong></li>
                            </ul>
                        </div>
                    </div>

                    <hr />
                    <div className="list-group">
                        {info.chapters.map(this.renderChapter)}
                    </div>
                </div>
            );

        } else {
            body = 'Title info not fetched. Try again.';
        }

        return (
            <div className='title-container'>
                {body}
            </div>
        );
    }
});

