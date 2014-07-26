/** @jsx React.DOM */
module.exports = React.createClass({
    css: {
        'text-align': 'center',
        'margin-top': '30px'
    },
    render: function(e) {
        if (this.props.hasOwnProperty('loading') &&
            this.props.loading === false) {
            return <div></div>;
        }

        var text = <h4>{this.props.text}</h4> || '';
        return (
            <div className='icon-container' style={this.css}>
                <i className='fa fa-5x fa-spinner fa-spin'></i>
                {text}
            </div>
        );
    }
});
