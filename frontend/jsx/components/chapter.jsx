/** @jsx React.DOM */
var Chapter = React.createClass({
    render: function() {
        var pages = this.state.pageUrls.map(function(url) {
            return (
                <img className="page-img" src={url} />
            );
        });

        return (
            <div className="chapter-container">
                <Loading loading={this.state.fetching} />
                {pages}
            </div>
        );
    },

    getInitialState: function() {
        this.fetchChapters();
        return {
            pageUrls: [],
            fetching: true
        };
    },

    fetchChapters: function() {
        this.setState({fetching: true});
        var self = this;
        $.ajax({
            url: '/api/chapter?url=' + self.props.url,
            dataType: 'json',
            method: 'GET',
            success: function(data) {
                self.setState({
                    pageUrls: data
                });
            },
            complete: function() {
                self.setState({fetching: false});
                console.log(self.state.fetching);
            }
        });
    },

});
