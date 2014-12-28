/** @jsx React.DOM */
var RouteMixin = require('../mixins/route.jsx');
var echo = require('../language.jsx').echo;

module.exports = React.createClass({
    pageTitle: echo('reset_password'),
    mixins: [RouteMixin],
    render: function() {
        return (
    <form className="center-form">
        <div className="col-lg-12">
            <div className="input-group">
                <input type="text" className="form-control" placeholder={echo('your_email')} />
                <span className="input-group-btn">
                    <button className="btn btn-success" type="button">{echo('reset_password')}</button>
                </span>
            </div>
        </div>
    </form>
        );
    }
});
