import os
from urllib import unquote
import jinja2
import webapp2
from pytaku.controllers import create_or_get_series, create_or_get_chapter
from common import crawlable

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
            'title': "Pytaku - The last online manga reader you'll ever need",
        }))


class SeriesRoute(webapp2.RequestHandler):

    @crawlable
    def get(self, query=None):
        url = unquote(query)
        series = create_or_get_series(url, no_update=True)

        template = jinja.get_template('series.html')
        self.response.write(template.render({
            'title': series.name,
            'thumb_url': series.thumb_url,
            'descriptions': series.description,
        }))


class ChapterRoute(webapp2.RequestHandler):

    @crawlable
    def get(self, query=None):
        url = unquote(query)
        chapter = create_or_get_chapter(url)
        series = create_or_get_series(chapter.series_url)
        template = jinja.get_template('series.html')
        self.response.write(template.render({
            'title': '%s - %s' % (chapter.name, chapter.series_name),
            'thumb_url': chapter.pages[0],
            'descriptions': series.description if series.description else [],
        }))
