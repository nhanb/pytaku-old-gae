import os


def crawlable(func):
    """
    Render crawler-friendly html to serve search engine and Open Graph bots.
    If requester is an actual browser, simply serve the client app's static
    html.
    """
    def wrapped(handler, query=None):
        # If requester is a bot, serve custom "bot version"
        crawlers = ('Googlebot', 'facebookexternalhit')
        for crawler in crawlers:
            if crawler in handler.request.headers['User-Agent']:
                return func(handler, query)

        # Not a bot. Let's serve the js app!
        with open(os.getcwd() + '/frontend-dist/app.html', 'r') as f:
            html = f.read()
        handler.response.write(html)
        return None

    return wrapped
