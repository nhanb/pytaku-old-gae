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

        if (this.props.hasOwnProperty('dismissible') &&
            this.props.dismissible === "true") {
            return (
                <div className={className + ' alert-dimissible'} role="alert">
                    <button type="button" className="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    {echo(this.props.msg)}
                </div>
            )
        }

        return (
            <div className="container">
                <div className={className} role="alert">{echo(this.props.msg)}</div>
            </div>
        );
    }
});
