var updateTitle = function() {
    var title;
    switch (typeof(this.pageTitle)) {
        case 'string':
            title = this.pageTitle + ' | Pytaku';
            break;
        case 'function':
            title = this.pageTitle() + ' | Pytaku';
            break;
        default:
            title = "Pytaku - The only manga reader page you'll ever need";
    }
    document.title = title;
};

module.exports = {
    componentDidUpdate: updateTitle,
    componentDidMount: updateTitle
};
