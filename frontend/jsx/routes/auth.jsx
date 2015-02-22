/** @jsx React.DOM */
var RouteMixin = require('../mixins/route.jsx');
var auth = require('../mixins/auth.jsx');
var HideWhenLoggedInMixin = auth.HideWhenLoggedInMixin;
var TextInput = require('../shared_components/text_input.jsx');
var CheckboxInput = require('../shared_components/checkbox_input.jsx');
var lang = require('../languages/index.js');
var shortcut = require('../keyboard_shortcuts.jsx');
var actions = require('../actions.js');
var sessionStore = require('../stores/session-store.js');

var AuthCommon = function(actionName) {

    // Ugly, I know. I just had a long day. Gimme a fucking break.
    var pageTitle, actionFunc, submitBtnText;
    if (actionName === 'login') {
        pageTitle = 'Login';
        actionFunc = actions.login;
        submitBtnText = 'login';
    } else if (actionName === 'register') {
        pageTitle = 'Register';
        actionFunc = actions.regster;
        submitBtnText = 'register';
    } else {
        alert("Looks like someone tried to be clever and broke everything...");
    }

    return React.createClass({
        mixins: [RouteMixin, HideWhenLoggedInMixin],
        pageTitle: pageTitle,

        componentDidMount: function() {
            sessionStore.bind(this.changed);
        },

        changed: function() {
            this.forceUpdate();
        },

        componentWillUnmount: function() {
            sessionStore.unbind(this.changed);
        },

        handleSubmit: function(e) {
            e.preventDefault();

            var email = this.refs.email.state.value;
            var password = this.refs.password.state.value;
            var remember = this.refs.remember.state.value;

            if (!email || !password) {
                return;
            }

            actionFunc({
                email: email,
                password: password,
                remember: remember ? '1' : '0',
            });
        },

        render: function() {
            var msgBlock = null;
            if (sessionStore.msg) {
                msgClass = 'alert alert-' + sessionStore.msgType;
                msgBlock =
                    <p className={msgClass} role='alert'>{sessionStore.msg}</p>
                ;
            }

            var submitBtn = this.renderSubmitBtn();

            return (
                <form onSubmit={this.handleSubmit}
                    className="form-horizontal center-form" role="form">
                    <TextInput ref="email" label="Email" type="email" />
                    <TextInput ref="password" label={echo('password')} type="password" />
                    <CheckboxInput ref="remember" label={echo('remember_me')} />

                    <div className="form-group">
                        <div className="col-sm-offset-2 col-sm-10">
                            {submitBtn}
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="col-sm-offset-2 col-sm-10">
                            <div className="checkbox">
                                <a href="/reset-password">{echo('forgot_password?')}</a>
                            </div>
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

        renderSubmitBtn: function() {
            if (sessionStore.loginStatus !== 'LOGGING_IN') {
                return (
                    <button type="submit" className="btn btn-primary">
                        {echo(submitBtnText)}
                    </button>
                );
            } else {
                return (
                    <button type="submit" className="btn btn-primary" disabled="disabled">
                        <i className="fa fa-spin fa-spinner"></i> Logging in...
                    </button>
                );
            }
        }
    });
};

module.exports = {
    Login: AuthCommon('login'),
    Register: AuthCommon('register'),
};
