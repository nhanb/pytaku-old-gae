/** @jsx React.DOM */
var RouteMixin = require('../mixins/route.jsx');
var TextInput = require('../shared_components/text_input.jsx');
var echo = require('../languages/index.js').echo;

var Request = React.createClass({
    pageTitle: echo('reset_password'),
    mixins: [RouteMixin],
    getInitialState: function() {
        return {
            submitting: false,
            msg: '',
            msgType: '',
            email: '',
        };
    },

    handleChange: function(event) {
        this.setState({email: event.target.value});
    },

    render: function() {
        var msgBlock ='';
        if (this.state.msg) {
            msgClass = 'alert alert-' + this.state.msgType;
            msgBlock =
                <p className={msgClass} role='alert'>{echo(this.state.msg)}</p>
            ;
        }

        var submitBtn = this.renderSubmitBtn(this.state.submitting);

        return (
            <form className="center-form" onSubmit={this.handleEmailSubmit}>

                <div className="form-group">
                    <div className="col-sm-12">
                        <div className="input-group">
                            <input type="text" className="form-control"
                                autofocus="autofocus"
                                value={this.state.email}
                                onChange={this.handleChange}
                                placeholder={echo('your_email')} />
                            <span className="input-group-btn">
                                {submitBtn}
                            </span>
                        </div>
                        <hr />
                    </div>
                </div>

                <div className="form-group">
                    <div className="col-sm-12">
                        {msgBlock}
                    </div>
                </div>

            </form>

        );
    },

    renderSubmitBtn: function(submitting) {
        if (!submitting) {
            return (
                <button type="submit" className="btn btn-primary">
                    {echo('reset_password')}
                </button>
            );
        } else {
            return (
                <button type="submit" className="btn btn-primary" disabled="disabled">
                    <i className="fa fa-spin fa-spinner"></i> {echo('processing')}
                </button>
            );
        }
    },

    handleEmailSubmit: function(e) {
        e.preventDefault();
        var email = this.state.email;
        if (!email) {
            return;
        }

        this.setState({
            submitting: true,
            msg: '',
        });
        var self = this;
        this.props.ajax({
            url: '/api/reset-password',
            method: 'POST',
            data: JSON.stringify({email: email}),
            success: function(data) {
                self.setState({
                    msgType: 'success',
                    msg: data.msg,
                });
            },
            error: function(err) {
                self.setState({
                    msgType: 'danger',
                    msg: err.responseJSON.msg,
                });
            },
            complete: function() {
                self.setState({submitting: false});
            },
        });
    }
});

var Reset = React.createClass({
    pageTitle: echo('set_new_password'),
    mixins: [RouteMixin],
    getInitialState: function() {
        return {
            submitting: false,
            msg: '',
            msgType: '',
        };
    },
    render: function() {
        var msgBlock ='';
        if (this.state.msg) {
            msgClass = 'alert alert-' + this.state.msgType;
            msgBlock =
                <p className={msgClass} role='alert'>{echo(this.state.msg)}</p>
            ;
        }

        var submitBtn = this.renderSubmitBtn(this.state.submitting);

        return (
            <form onSubmit={this.handleSubmit}
                className="form-horizontal center-form" role="form">
                <TextInput ref="password" label="Password" type="password" />
                <TextInput ref="confirm" label="Confirm password" type="password" />

                <div className="form-group">
                    <div className="col-sm-offset-2 col-sm-10">
                        {submitBtn}
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

    renderSubmitBtn: function(submitting) {
        if (!submitting) {
            return (
                <button type="submit" className="btn btn-primary">
                    {echo('set_new_password')}
                </button>
            );
        } else {
            return (
                <button type="submit" className="btn btn-primary" disabled="disabled">
                    <i className="fa fa-spin fa-spinner"></i> {echo('processing')}
                </button>
            );
        }
    },

    handleSubmit: function(e) {
        e.preventDefault();

        var token = this.props.token;
        var password = this.refs.password.state.value;
        var confirm = this.refs.confirm.state.value;
        if (!token || !password || !confirm) {
            return;
        }

        if (password !== confirm) {
            this.setState({
                msg: 'password_confirm_mismatch',
                msgType: 'danger',
            });
            return;
        }

        this.setState({
            submitting: true,
            msg: '',
        });
        var self = this;
        this.props.ajax({
            url: '/api/set-new-password',
            method: 'POST',
            data: JSON.stringify({
                token: token,
                password: password,
            }),
            success: function(data) {
                self.setState({
                    msgType: 'success',
                    msg: data.msg,
                });
            },
            error: function(err) {
                self.setState({
                    msgType: 'danger',
                    msg: err.responseJSON.msg,
                });
            },
            complete: function() {
                self.setState({submitting: false});
            },
        })

        return;
    }
});


module.exports = {
    Reset: Reset,
    Request: Request,
};
