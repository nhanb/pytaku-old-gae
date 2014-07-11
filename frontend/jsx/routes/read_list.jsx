/** @jsx React.DOM */
var ReadList = React.createClass({
    mixins: [RouteMixin],
    pageTitle: 'My manga read list',

    getInitialState: function() {
        return {
            titles: [],
            loading: false,
            errMsg: '',
        };
    },

    componentDidMount: function() {
        if (!this.props.loggedIn) {
            return;
        }
        var self = this;
        this.setState({loading: true});
        this.props.ajax({
            url: '/api/read-list',
            success: function(data) {
                self.setState({
                    titles: data,
                });
            },
            error: function(data) {
                self.setState({errMsg: data.responseJSON.msg});
            },
            complete: function() {
                self.setState({loading: false});
            }
        });
    },

    render: function() {
        var content;

        // Gatekeeper. Duh!
        if (!this.props.loggedIn) {
            content = (
                <div className="alert alert-danger" role="alert">
                    This feature requires <a href="/#/login">logging in</a>.
                </div>
            );

        // Simple spinning loading icon
        } else if (this.state.loading === true) {
            content = <Loading />;

        // Finished loading but there's an error
        } else if (this.state.errMsg) {
            content = (
                <div className="alert alert-danger" role="alert">
                    {this.state.errMsg}
                </div>
            );

        // No error but user has nothing in read list yet
        } else if (this.state.titles.length === 0) {
            content = (
                <div className="alert alert-warning" role="alert">
                    You have nothing in your read list yet :)
                </div>
            );

        // Everything worked! Let's render some useful data:
        } else {

            var table_body = this.state.titles.map(function(title) {
                return (
                    <tr key={title.url}>
                        <td>{title.name}</td>
                        <td>blah</td>
                        <td>blah</td>
                    </tr>
                );
            });

            content = (
                <table className="table table-bordered table-hover">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Latest chapter</th>
                            <th>Go to chapter</th>
                        </tr>
                    </thead>
                    <tbody>
                        {table_body}
                    </tbody>
                </table>
            );
        }

        return (
            <div className="container">
                {content}
            </div>
        );
    }
});
