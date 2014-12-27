/** @jsx React.DOM */
var echo = require('../language.jsx').echo;

module.exports = React.createClass({
    render: function() {
        if (!this.props.msg) {
            return <span></span>;
        }

        if (this.props.hasOwnProperty('cssClass')) {
            var cssClass = this.props.cssClass;
        } else {
            var cssClass = 'danger';
        }

        var className = "alert alert-" + cssClass;
        return (
            <div className="container">
                <div className={className} role="alert">{echo(this.props.msg)}</div>
            </div>
        );
    }
});
