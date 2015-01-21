/** @jsx React.DOM */
var echo = require('./languages/index.js').echo;

module.exports = React.createClass({

    render: function() {
        var currentRoute = this.props.route;
        var active = function(routeName) {
            return routeName === currentRoute ? 'active' : ''
        };

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
                    <li className={active('login')}><a href="/login">{echo('nav_login')}</a></li>
                    <li className={active('register')}><a href="/register">{echo('nav_register')}</a></li>
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
        <li className={active('search')}>
          <a href="/search/name/"><i className="fa fa-search fa-lg"></i> {search} </a>
        </li>
        <li className={active('series-bookmarks')}>
          <a href="/series-bookmarks"><i className="fa fa-star fa-lg"></i> {series}</a>
        </li>
        <li className={active('chapter-bookmarks')}>
          <a href="/chapter-bookmarks"><i className="fa fa-bookmark fa-lg"></i> {chapters}</a>
        </li>
        <li className={active('settings')}>
          <a href="/settings"><i className="fa fa-gear fa-lg"></i> {settings}</a>
        </li>
      </ul>
      {right_navs}
    </div>
  </div>
</div>
        );
    }
});
