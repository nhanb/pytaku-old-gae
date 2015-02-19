/** @jsx React.DOM */

var modalId = 'myModal';
var modalSelector = '#' + modalId;

var EasterEgg = React.createClass({
    getInitialState: function() {
        return {triggered: false};
    },

    componentDidMount: function() {
        var self = this;
        Mousetrap.bind('up up down down left right left right b a', function() {
            self.show();
        });
    },

    show: function() {
        if (this.state.triggered === false) {
            var videoSrc = [
                'https://www.youtube.com/embed/FCQZKZBVx_g',
                '?rel=0',
                '&autoplay=1',
                '&showinfo=0',
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
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-body">
                            <div className="video-wrapper" style={this.wrapperCss}>
                                <iframe src="" style={this.iframeCss}
                                    allowFullScreen="1" frameBorder="0"></iframe>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    },

    /*
     * Css magic to make video size responsive:
     * http://css-tricks.com/NetMag/FluidWidthVideo/Article-FluidWidthVideo.php
     */

    wrapperCss: {
        position: 'relative',
        paddingBottom: '75%',  // 4:3 ratio
        paddingTop: '0px',
        height: '0',
    },

    iframeCss: {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
    }
});

module.exports = EasterEgg;
