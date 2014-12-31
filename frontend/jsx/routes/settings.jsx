/** @jsx React.DOM */
var RouteMixin = require('../mixins/route.jsx');
var lang = require('../language.jsx');
var echo = lang.echo;

module.exports = React.createClass({
    mixins: [RouteMixin],
    pageTitle: echo('user_settings'),

    render: function() {
        langOptions = lang.supported.map(function(l) {
            var code = l[0];
            var name = l[1];
            return <option key={'opt_' + code} value={code}>{echo(name)}</option>;
        });

        return (
            <form className="form-horizontal center-form" role="form"
                onSubmit={this.handleSubmit}>

                <div className="form-group">
                    <label className="col-sm-3 control-label">{echo('language')}</label>
                    <div className="col-sm-9">
                        <select className="form-control" ref="langSelect" defaultValue={lang.chosen}>
                            {langOptions}
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <div className="col-sm-offset-3 col-sm-9">
                        <button type="submit" className="btn btn-default">{echo('save')}</button>
                    </div>
                </div>

            </form>
        );
    },

    handleSubmit: function(e) {
        e.preventDefault();

        var chosenLang = this.refs.langSelect.state.value;

        if (this.props.loggedIn) {
            this.props.ajax({
                url: '/api/settings',
                method: 'POST',
                data: JSON.stringify({
                    language: chosenLang,
                }),
                success: function(data) {
                    lang.set(chosenLang);
                },
            });

        } else if (chosenLang !== lang.chosen) {
            lang.set(chosenLang);
        }

        return
    }
});
