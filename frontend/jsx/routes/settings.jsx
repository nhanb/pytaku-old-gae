/** @jsx React.DOM */
var RouteMixin = require('../mixins/route.jsx');
var lang = require('../languages/index.js');
var shortcut = require('../keyboard_shortcuts.jsx');
var echo = lang.echo;


module.exports = React.createClass({
    mixins: [RouteMixin],
    pageTitle: echo('user_settings'),

    getInitialState: function() {
        return {
            saving: false,
            chosenLang: lang.chosen,
            enableShortcut: shortcut.isEnabled(),
        };
    },

    componentDidMount: function() {
        this.setState({
            enableShortcut: shortcut.isEnabled(),
        });
    },

    handleLangChange: function(e) {
        this.setState({
            chosenLang: e.target.value,
        });
    },

    handleShortcutChange: function(e) {
        this.setState({
            enableShortcut: e.target.checked,
        });
    },

    render: function() {
        var langOptions = lang.supported.map(function(l) {
            var code = l[0];
            var name = l[1];
            return <option key={'opt_' + code} value={code}>{echo(name)}</option>;
        });

        var saveBtn;

        if (this.state.saving) {
            saveBtn = (
                <button type="submit" className="btn btn-default">
                    <i className='fa fa-spinner fa-spin'></i> {echo('saving')}...
                </button>
            );
        } else {
            saveBtn = <button type="submit" className="btn btn-default">{echo('save')}</button>;
        }

        return (
            <form className="form-horizontal center-form" role="form"
                onSubmit={this.handleSubmit}>

                <div className="form-group">
                    <label className="col-sm-4 control-label">{echo('language')}</label>
                    <div className="col-sm-8">
                        <select className="form-control" onChange={this.handleLangChange}
                            value={this.state.chosenLang}>
                            {langOptions}
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label className="col-sm-4 control-label">{echo('keyboard_shortcuts')}</label>
                    <div className="col-sm-8">
                        <div className="checkbox">
                            <label>
                                <input type="checkbox" onChange={this.handleShortcutChange}
                                    checked={this.state.enableShortcut} /> {echo('enable')}
                            </label>
                        </div>
                    </div>
                </div>

                <br />
                <div className="form-group">
                    <div className="col-sm-offset-4 col-sm-8">
                        {saveBtn}
                    </div>
                </div>

            </form>
        );
    },

    handleSubmit: function(e) {
        e.preventDefault();

        var chosenLang = this.state.chosenLang;
        var enableShortcut = this.state.enableShortcut;
        this.setState({saving: true});

        var self = this;
        if (this.props.loggedIn) {
            this.props.ajax({
                url: '/api/settings',
                method: 'POST',
                data: JSON.stringify({
                    language: chosenLang,
                    enable_shortcut: enableShortcut ? '1' : '0',
                }),
                success: function(data) {
                    shortcut.set(enableShortcut);
                    lang.set(chosenLang);

                    if (data.changed_fields.length > 0) {
                        location.reload();
                    }
                },
                complete: function() {
                    self.setState({saving: false});
                },
            });

        } else {
            lang.set(chosenLang);
            shortcut.set(enableShortcut);
            location.reload();
            self.setState({saving: false});
        }
    }
});
