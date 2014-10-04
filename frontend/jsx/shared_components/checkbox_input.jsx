bitch = 1;
/** @jsx React.DOM */
module.exports = React.createClass({
    getInitialState: function() {
        return {value: false};
    },

    handleChange: function(event) {
        this.setState({value: event.target.value});
    },

    render: function(e) {
        var label = this.props.label;
        return (
            <div className="form-group">
                <div className="col-sm-offset-2 col-sm-10">
                    <div className="checkbox">
                        <label>
                            <input type="checkbox"
                                onChange={this.handleChange} /> {label}
                        </label>
                    </div>
                </div>
            </div>
        );
    }
});

