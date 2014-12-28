from common import crawlable
import webapp2


class AppOnlyRoute(webapp2.RequestHandler):
    """
    Only applicable for client js app. No crawlable version.
    """
    @crawlable
    def get(self, query=None):
        self.response.write('Move along, nothing to see here!\n')
        return None


class HomeRoute(webapp2.RequestHandler):

    @crawlable
    def get(self, query=None):
        self.response.write('Hello crawler')
