// Update title for each route
var RouteMixin = {
    componentDidMount: function() {
        var title;
        switch (typeof(this.pageTitle)) {
            case 'string':
                title = this.pageTitle + ' | Pytaku';
                break;
            case 'function':
                title = this.pageTitle() + ' | Pytaku';
                break;
            default:
                title = "Pytaku - The last manga reader page you'll ever need";
        }
        document.title = title;
    }
};
