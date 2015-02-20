/** @jsx React.DOM */

var BindingsModal = React.createClass({
    render: function() {
        var bindingRows = this.props.bindings.map(function(b, index) {
            var desc = echo(b[1]);
            var keys;

            if (typeof b[0] === 'string') {
                keys = <code key={'pre_' + index}>{b[0]}</code>;
            } else {
                var items = b[0].map(function(k, kindex) {
                    return (
                        <li><code key={'pre_' + kindex}>{k}</code></li>
                    );
                });
                keys = <ul className='slash-separated'>{items}</ul>;
            }

            return (
                <tr key={'bindingRow' + index}>
                    <td>{keys}</td>
                    <td>{desc}</td>
                </tr>
            );
        });

        var bindings = (
            <table className="table table-bordered" style={{textAlign: 'left'}}>
                <tbody>
                    {bindingRows}
                </tbody>
            </table>
        );

        return (
            <div className="modal" id="bindingsModal" tabIndex="-1" role="dialog">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="close" data-dismiss="modal">
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <h4 className="modal-title" id="myModalLabel">
                                {echo('keyboard_shortcuts')}
                            </h4>
                        </div>
                        <div className="modal-body">
                            {bindings}
                        </div>
                    </div>
                </div>
            </div>
        );
    },
});

// Inspired by https://chromabits.com/post/mousetrap--reactjs
var MousetrapMixin = {
    // Array of key-description pairs:
    // [ ['a', 'do_A'], [...], ... ]
    mousetrapBindings: [],

    bindShortcut: function(description, key, callback) {
        Mousetrap.bind(key, callback);
        this.mousetrapBindings.push([key, description]);
    },

    unbindAll: function() {
        this.mousetrapBindings.forEach(function(binding) {
            Mousetrap.unbind(binding[0]);
        });
    },

    renderBindings: function() {
        return <BindingsModal bindings={this.mousetrapBindings} />;
    },

    // Remove any Mousetrap bindings before unmounting
    componentWillUnmount: function() {
        this.unbindAll();
    },
};

Mousetrap.bind('?', function() {
    $('#bindingsModal').modal();
});

module.exports = MousetrapMixin;
