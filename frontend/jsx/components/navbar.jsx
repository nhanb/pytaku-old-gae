/** @jsx React.DOM */
var Navbar = React.createClass({
    render_right: function() {
        return  (
            <ul className="nav navbar-nav navbar-right">
                <li><a href="#">Login</a></li>
                <li><a href="#/register">Register</a></li>
            </ul>
        );
    },

    render: function() {
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
      {this.render_right()}
    </div>
  </div>
</div>
        );
    }
});
