/** @jsx React.DOM */
var RouteMixin = require('../mixins/route.jsx');

module.exports = React.createClass({
    mixins: [RouteMixin],
    render: function() {
        return (
            <div className="container">
                <h2>{echo('pytaku_is_deprecated')}</h2>
                <p>{echo('deprecation_warning')}</p>
                <a href="https://gitter.im/nhanb/pytaku" className="external">
                  <i className="fa fa-lg fa-comment"></i> https://gitter.im/nhanb/pytaku
                </a>
                <hr />
                <h2>{echo('welcome_to_pytaku')}</h2>
                <p>{echo('pytaku_is')}</p>
                <p>{echo('pytaku_instructions')}</p>
                <p>{echo('can_be_found_on_github')}:</p>
                <a href="https://github.com/nhanb/pytaku" className="external">
                    <i className="fa fa-lg fa-github"></i> https://github.com/nhanb/pytaku
                </a>
            </div>
        );
    }
});
