/** @jsx React.DOM */

/**
 * Trigger something totally inappropriate when user enters the
 * right sequence of the Konami code.
 *
 * callback is the function you want to execute when the complete sequence
 * has been entered.
 */
var konamiCode = function(callback) {

    // The famous Konami sequence in keycodes
    // up up down down left right left right b a
    var sequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
    var ko = sequence.slice();  // deep copy it

    // Get the rest of this function's arguments (if any).
    // These will be used as the callback's arguments.
    var args = [];
    for (var i = 1, len = arguments.length; i < len; i++) {
        args.push(arguments[i]);
    }

    document.addEventListener('keydown', function(e) {
        if (e.keyCode == ko[0]) {
            ko.splice(0,1);
            if (ko.length === 0) {
                callback.apply(null, args);
                ko = sequence.slice();
            }
        } else {
            ko = sequence.slice();
        }
    });
};


var modalId = 'myModal';
var modalSelector = '#' + modalId;

var EasterEgg = React.createClass({
    getInitialState: function() {
        return {triggered: false};
    },

    componentDidMount: function() {
        var self = this;
        konamiCode(function() {
            self.show();
        });
    },

    show: function() {
        if (this.state.triggered === false) {
            var videoSrc = [
                'https://www.youtube.com/embed/FCQZKZBVx_g',
                '?rel=0',
                '&autoplay=1',
                '&wmode=transparent',  // to prevent any weird bug
            ].join('');
            $(modalSelector + ' iframe').attr('src', videoSrc);
        }
        $(modalSelector).modal({});
        this.setState({triggered: true});
    },

    render: function() {
        return (
            <div className="modal fade" id={modalId} tabIndex="-1">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-body">
                            <iframe height="480px" width="100%" src=""
                                allowFullScreen="1" frameBorder="0"></iframe>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
});

module.exports = EasterEgg;
