/** @jsx React.DOM */
var Loading = require('../shared_components/loading.jsx');

module.exports = React.createClass({

    renderChapter: function(chapter) {
        var href = '/#/chapter/' + encodeURIComponent(chapter.url);
        var progress = '';
        if (chapter.progress === 'finished'
            || chapter.progress === 'reading') {
            progress = <span className="badge alert-success">{chapter.progress}</span>;
        }
        return (
            <a href={href} key={chapter.url} className="list-group-item">
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
