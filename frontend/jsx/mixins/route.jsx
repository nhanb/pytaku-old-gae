// Update title for each route
var RouteMixin = {
    componentDidMount: function() {
        var title;
        if (this.pageTitle) {
            title = this.pageTitle + ' | Pytaku';
        } else {
            title = "Pytaku - The last manga reader page you'll ever need";
        }
        document.title = title;
    }
};
