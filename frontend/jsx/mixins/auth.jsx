/** @jsx React.DOM */

/*
 * All authorization-related functionalities for components other than
 * PytakuApp go here
 */

exports.RequireLoginMixin = {
    componentDidMount: function() {
        if (this.props.loggedIn === false) {
            setTimeout(function() {
                window.location.href = '/login';
            }, 50);
            // Notice the stupid setTimeout? For whatever reason if you visit a
            // "requireLogin" route directly using the address bar (instead of
            // clicking its link from another route), then you will be
            // redirected to the login route WITHOUT the previous route in your
            // history (at least for Chrome). Delaying the redirection with a
            // setTimeout() seems to solve that. Of course I'll need to find
            // some proper fix for this but for now... whatever!
        }
    },
};

exports.HideWhenLoggedInMixin = {
    componentWillReceiveProps: function(nextProps) {
        this.hideWhenLoggedIn(nextProps.loggedIn);
    },

    componentWillMount: function() {
        this.hideWhenLoggedIn(this.props.loggedIn);
    },

    hideWhenLoggedIn: function(loggedIn) {
        if (loggedIn === true) {
            if (history.length > 2) { // new tab (blank) page + current page
                history.back();
            } else {
                window.location.href = '/';
            }
        }
    }
};
