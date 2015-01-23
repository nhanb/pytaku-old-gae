import webapp2
from pytaku.controllers import create_or_get_chapter


class FetchChapterWorker(webapp2.RequestHandler):
    def post(self):
        url = self.request.get('url')
        create_or_get_chapter(url)
