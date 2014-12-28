/** @jsx React.DOM */
var Loading = require('../shared_components/loading.jsx');
echo = require('../language.jsx').echo;

module.exports = React.createClass({

    renderChapter: function(chapter, index) {
        var href = '/chapter/' + encodeURIComponent(chapter.url);
        var progress = '';
        if (chapter.progress === 'finished') {
            progress = <span className="badge">{echo('finished')}</span>;
        } else if (chapter.progress === 'reading') {
            progress = <span className="badge alert-info">{echo('reading')}</span>;
        }
        return (
            <a href={href} key={chapter.url + index} className="list-group-item">
                {chapter.name} {progress}
            </a>
        );
    },

    render: function() {
        return (
            <div className="list-group">
                {this.props.chapters.map(this.renderChapter)}
            </div>
        );
    }
});
