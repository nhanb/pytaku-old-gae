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
                {pages}
            </div>
        );
    },

    getInitialState: function() {
        this.fetchChapters();
        return {pageUrls: []};
    },

    fetchChapters: function() {
        var self = this;
        $.ajax({
            url: '/api/chapter?url=' + self.props.url,
            dataType: 'json',
            method: 'GET',
            success: function(data) {
                self.setState({
                    pageUrls: data
                });
            }
        });
    },

});
