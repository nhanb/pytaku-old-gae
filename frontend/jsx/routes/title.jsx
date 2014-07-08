/** @jsx React.DOM */
var Title = React.createClass({
    mixins: [RouteMixin],
    pageTitle: function() {
        return this.state.info.name;
    },

    getInitialState: function() {
        this.populateInfo();
        return {
            populating: true
        };
    },

    populateInfo: function() {
        this.setState({populating: true});
        var self = this;
        $.ajax({
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

    render: function() {
        var titleInfo;

        if (this.state.populating) {
            titleInfo = <Loading />;
        } else if (this.state.populated) {
            titleInfo = <TitleInfo info={this.state.info} />;
        } else {
            titleInfo = 'Title info not fetched. Try again.';
        }
        return (
            <div className='title-container'>
                {titleInfo}
            </div>
        );
    }
});
