import os
from common import crawlable
import jinja2
import webapp2

jinja = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__) + '/templates'),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)


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
        template = jinja.get_template('home.html')
        self.response.write(template.render({
            'title': 'Home',
        }))
