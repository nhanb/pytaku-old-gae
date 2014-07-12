/** @jsx React.DOM */
var ScrollToTopBtn = React.createClass({
    css: {
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        display: 'none',
    },

    componentDidMount: function() {
        $(window).scroll(function() {
            if ($(this).scrollTop() > 100) {
                $('#up-btn').fadeIn();
            } else {
                $('#up-btn').fadeOut();
            }
        });
    },

    handleClick: function() {
        $('html, body').animate({scrollTop : 0}, 300);
    },

    render: function() {
        return (
            <div id="up-btn" style={this.css} onClick={this.handleClick}>
                <a>
                    <i className="fa fa-4x fa-arrow-circle-up clickable"></i>
                </a>
            </div>
        );
    }
});
