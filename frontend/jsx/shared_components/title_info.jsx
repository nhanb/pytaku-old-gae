/** @jsx React.DOM */
var TitleInfo = React.createClass({
    renderChapter: function(chapter) {
        var href = '/#/chapter/' + encodeURIComponent(chapter.url);
        return (
            <a href={href} className="list-group-item">
                {chapter.name}
            </a>
        );
    },

    render: function() {
        var info = this.props.info;
        var permalink = '/#/title/' + info.url;
        return (
            <div className="title-info">
                <div className="row">

                    <div className="col-md-4">
                        <a className="thumbnail">
                            <img src={info.thumb_url} alt="thumbnail" />
                        </a>
                    </div>

                    <div className="col-md-8">
                        <h2 className="title-name">{info.name}</h2>
                        <ul>
                            <li><a href={permalink}>permanent link</a></li>
                            <li><strong>more details to be implemented...</strong></li>
                        </ul>
                    </div>
                </div>

                <hr />
                <div className="list-group">
                    {info.chapters.map(this.renderChapter)}
                </div>
            </div>
        );
    }
});

