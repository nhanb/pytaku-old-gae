/** @jsx React.DOM */
var Navbar = React.createClass({
    mixins: [AuthMixin],
    shit: 'navbar',

    handleLogin: function() {
        this.setState({loggedIn: true});
    },

    handleLogout: function() {
        this.setState({loggedIn: false});
    },

    render: function() {
        var right_navs;
        if (this.state.loggedIn === true) {
            right_navs = (
                <div>
                    <button id='logout'
                        className="navbar-btn navbar-right btn btn-danger"
                        onClick={this.logout}>Logout</button>

                    <p className="navbar-text navbar-right">
                        Welcome, <strong>{this.getEmail()}</strong>
                    </p>
                </div>

            );
        } else {
            right_navs =  (
                <ul className="nav navbar-nav navbar-right">
                    <li><a href="#/login">Login</a></li>
                    <li><a href="#/register">Register</a></li>
                </ul>
            );
        }

        return (
<div className="navbar navbar-default navbar-static-top" role="navigation">
  <div className="container">
    <div className="navbar-header">
      <button type="button" className="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
        <span className="sr-only">Toggle navigation</span>
        <span className="icon-bar"></span>
        <span className="icon-bar"></span>
        <span className="icon-bar"></span>
      </button>
      <a className="navbar-brand" href="#">Pytaku</a>
    </div>
    <div className="navbar-collapse collapse">
      <ul className="nav navbar-nav">
        <li><a href="#/search"><i className="fa fa-search fa-lg"></i> Search titles</a></li>
      </ul>
      {right_navs}
    </div>
  </div>
</div>
        );
    }
});
