/** @jsx React.DOM */
var TextInput = React.createClass({
    render: function(e) {
        return (
            <div className="form-group">
                <label className="col-sm-2 control-label">
                    {this.props.label}
                </label>
                <div className="col-sm-10">
                <input type={this.props.type} className="form-control"
                    placeholder={this.props.placeholder} />
                </div>
            </div>
        )
    }
});

var Register = React.createClass({

    getInitialState: function() {
        return {
            email: '',
            password: '',
            errMsg: ''
        };
    },

    render: function() {
        return (
            <form className="form-horizontal" role="form" >
                <TextInput label="Email" type="email" placeholder="Email" />
                <TextInput label="Password" type="password" placeholder="Password" />
            </form>
        )
    },

});
