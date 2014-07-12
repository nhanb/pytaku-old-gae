/** @jsx React.DOM */

// Each item represents a title, displaying its name and latest chapters
var ReadListItem = React.createClass({
    getInitialState: function() {
        return {
            chapters: [],
            loading: false,
            removed: false,
        };
    },

    componentDidMount: function() {
        this.setState({loading: true});

        url = '/api/title?url=' + encodeURIComponent(this.props.url);
        url += '&chapter_limit=' + this.props.chapter_num;

        var self = this;
        this.props.ajax({
            url: url,
            success: function(data) {
                self.setState({
                    chapters: data.chapters,
                    loading: false
                });
            }
        });
    },

    render: function() {
        if (this.state.removed === true) {
            return <tbody></tbody>;
        }

        var returnVal;
        var chapters = this.state.chapters;
        var latestChapters = '';
        var nameRowSpan = 1;

        var removeBtn = <button onClick={this.remove}
            className="btn btn-danger">remove</button>;

        var titleHref = '/#/title/' + encodeURIComponent(this.props.url);
        var titleA = <a href={titleHref}>{this.props.name}</a>;

        if (!this.state.loading) {

            var latest = chapters.slice(0, this.props.chapter_num);
            nameRowSpan = latest.length;

            var chapterArray = latest.map(function(chapter) {
                var href = '/#/chapter/' + encodeURIComponent(chapter.url);
                return <a href={href}>{chapter.name}</a>;
            });
            var firstChapter = chapterArray.splice(0,1);

            var remaining = chapterArray.map(function(chapter) {
                return <tr><td>{chapter}</td></tr>;
            });

            returnVal =  (
                <tbody>
                    <tr key={this.props.url}>
                        <td rowSpan={nameRowSpan}>{removeBtn} {titleA}</td>
                        <td>{firstChapter}</td>
                    </tr>
                    {remaining}
                </tbody>
            );

        } else {
            returnVal = (
                <tbody>
                    <tr key={this.props.url}>
                        <td>{removeBtn} {titleA}</td>
                        <td><i className="fa fa-lg fa-spinner fa-spin"></i></td>
                    </tr>
                </tbody>
            );
        }

        return returnVal;
    },

    remove: function() {
        var self = this;
        this.props.ajax({
            url: '/api/read-list',
            method: 'POST',
            data: JSON.stringify({
                url: this.props.url,
                action: 'remove'
            }),
            success: function() {
                self.setState({removed: true});
            }
        });
    }
});

var ReadList = React.createClass({
    mixins: [RouteMixin],
    pageTitle: 'My manga read list',

    getInitialState: function() {
        return {
            titles: [],
            loading: false,
            errMsg: '',
        };
    },

    componentDidMount: function() {
        if (!this.props.loggedIn) {
            return;
        }
        var self = this;
        this.setState({loading: true});
        this.props.ajax({
            url: '/api/read-list',
            success: function(data) {
                self.setState({
                    titles: data,
                });
            },
            error: function(data) {
                self.setState({errMsg: data.responseJSON.msg});
            },
            complete: function() {
                self.setState({loading: false});
            }
        });
    },

    render: function() {
        var content;

        // Gatekeeper. Duh!
        if (!this.props.loggedIn) {
            content = (
                <div className="alert alert-danger" role="alert">
                    This feature requires <a href="/#/login">logging in</a>.
                </div>
            );

        // Simple spinning loading icon
        } else if (this.state.loading === true) {
            content = <Loading />;

        // Finished loading but there's an error
        } else if (this.state.errMsg) {
            content = (
                <div className="alert alert-danger" role="alert">
                    {this.state.errMsg}
                </div>
            );

        // No error but user has nothing in read list yet
        } else if (this.state.titles.length === 0) {
            content = (
                <div className="alert alert-warning" role="alert">
                    You have nothing in your read list yet :)
                </div>
            );

        // Everything worked! Let's render some useful data:
        } else {
            var self = this;
            var table_body = this.state.titles.map(function(title) {
                return <ReadListItem url={title.url} name={title.name}
                    ajax={self.props.ajax} key={title.url} chapter_num="5" />;
            });

            content = (
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Latest chapters</th>
                        </tr>
                    </thead>
                    {table_body}
                </table>
            );
        }

        return (
            <div className="container">
                {content}
            </div>
        );
    }
});
