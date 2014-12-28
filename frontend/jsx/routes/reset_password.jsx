/** @jsx React.DOM */
var RouteMixin = require('../mixins/route.jsx');
var echo = require('../language.jsx').echo;

module.exports = React.createClass({
    pageTitle: echo('reset_password'),
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
            <form className="center-form" onSubmit={this.handleEmailSubmit}>

                <div className="form-group">
                    <div className="col-sm-12">
                        <div className="input-group">
                            <input type="text" ref="email" className="form-control"
                                autofocus="autofocus"
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

    handleEmailSubmit: function() {
        var email = this.refs.email.state.value;
        if (!email) {
            return false;
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
        })

        return false;
    }
});
