/** @jsx React.DOM */
var echo = require('./language.jsx').echo;

module.exports = React.createClass({

    render: function() {
        var right_navs;
        if (this.props.loggedIn === true) {
            right_navs = (
                <div>
                    <button id='logout'
                        className="navbar-btn navbar-right btn btn-danger"
                        onClick={this.props.logout}>{echo('nav_logout')}</button>

                    <p className="navbar-text navbar-right">
                        {echo('nav_welcome')} <strong>{this.props.email}</strong>
                    </p>
                </div>

            );
        } else {
            right_navs =  (
                <ul className="nav navbar-nav navbar-right">
                    <li><a href="/login">{echo('nav_login')}</a></li>
                    <li><a href="/register">{echo('nav_register')}</a></li>
                </ul>
            );
        }

        var search = echo('nav_search');
        var series = echo('nav_my_series');
        var chapters = echo('nav_my_chapters');
        var settings = echo('user_settings');

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
      <a className="navbar-brand" href="/">Pytaku</a>
    </div>
    <div className="navbar-collapse collapse">
      <ul className="nav navbar-nav">
        <li><a href="/search/name/"><i className="fa fa-search fa-lg"></i> {search} </a></li>
        <li><a href="/series-bookmarks"><i className="fa fa-star fa-lg"></i> {series}</a></li>
        <li><a href="/chapter-bookmarks"><i className="fa fa-bookmark fa-lg"></i> {chapters}</a></li>
        <li><a href="/settings"><i className="fa fa-gear fa-lg"></i> {settings}</a></li>
      </ul>
      {right_navs}
    </div>
  </div>
</div>
        );
    }
});
