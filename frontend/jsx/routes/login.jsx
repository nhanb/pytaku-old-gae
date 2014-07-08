/** @jsx React.DOM */
var Login = React.createClass({
    mixins: [RouteMixin, HideWhenLoggedInMixin],
    pageTitle: 'Login',

    getInitialState: function() {
        return {
            msg: '',
            msgType: 'info',
        };
    },

    handleSubmit: function() {
        var email = this.refs.email.state.value;
        var password = this.refs.password.state.value;

        if (!email || !password) {
            return false;
        }

        this.setState({
            msg: ''
        });
        var data = JSON.stringify({
            email: email,
            password: password
        });
        var self = this;
        $.ajax({
            url: '/api/auth',
            dataType: 'json',
            method: 'POST',
            data: data,
            success: function(data) {
                self.setState({
                    msgType: 'success',
                    msg: 'Successfully logged in.'
                });
                self.props.setLoggedIn(email, data.token);
            },
            error: function(data) {
                self.setState({
                    msgType: 'danger',
                    msg: data.responseJSON.msg
                });
            }
        });

        return false;
    },

    render: function() {
        var msgBlock ='';
        if (this.state.msg) {
            msgClass = 'alert alert-' + this.state.msgType;
            msgBlock =
                <p className={msgClass} role='alert'>{this.state.msg}</p>
            ;
        }
        return (
            <form onSubmit={this.handleSubmit}
                className="form-horizontal" role="form">
                <TextInput ref="email" label="Email" type="email" />
                <TextInput ref="password" label="Password" type="password" />

                <div className="form-group">
                    <div className="col-sm-offset-2 col-sm-10">
                        <button type="submit" className="btn btn-primary">
                            Login
                        </button>
                    </div>
                </div>

                <div className="form-group">
                    <div className="col-sm-offset-2 col-sm-10">
                        {msgBlock}
                    </div>
                </div>
            </form>
        );
    },

});
