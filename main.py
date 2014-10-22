import sys
sys.path.insert(0, 'lib')
import webapp2
from pytaku.api.api import RegisterHandler, LoginHandler, SeriesHandler,\
    SearchHandler, ChapterHandler, TestTokenHandler, LogoutHandler,\
    SeriesBookmarkHandler, ChapterBookmarkHandler, ChapterProgressHandler


app = webapp2.WSGIApplication([
    ('/api/register', RegisterHandler),
    ('/api/login', LoginHandler),
    ('/api/logout', LogoutHandler),
    ('/api/series', SeriesHandler),
    ('/api/chapter', ChapterHandler),
    ('/api/search', SearchHandler),
    ('/api/test-token', TestTokenHandler),
    ('/api/series-bookmark', SeriesBookmarkHandler),
    ('/api/chapter-bookmark', ChapterBookmarkHandler),
    ('/api/chapter-progress', ChapterProgressHandler),
], debug=True)
