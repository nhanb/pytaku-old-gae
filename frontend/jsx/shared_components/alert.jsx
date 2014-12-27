/** @jsx React.DOM */
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
            <div className="container">
                <div className={className + ' alert-dismissible'} role="alert">
                    <button type="button" className="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    {this.props.msg}
                </div>
            </div>
            )
        }

        return (
            <div className="container">
                <div className={className} role="alert">{this.props.msg}</div>
            </div>
        );
    }
});
