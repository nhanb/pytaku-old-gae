/** @jsx React.DOM */
module.exports = React.createClass({
    getInitialState: function() {
        return {value: ''};
    },

    handleChange: function(event) {
        this.setState({value: event.target.value});
    },

    render: function(e) {
        var label = this.props.label,
            type = this.props.type,
            placeholder = this.props.placeholder || '';

        return (
            <div className="form-group">
                <label className="col-sm-2 control-label">
                    {label}
                </label>
                <div className="col-sm-10">
                    <input type={type} onChange={this.handleChange}
                        className="form-control" placeholder={placeholder} />
                </div>
            </div>
        );
    }
});

