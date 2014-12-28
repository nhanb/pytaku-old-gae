import sys
sys.path.insert(0, 'lib')
import webapp2
from pytaku.api.api import RegisterHandler, LoginHandler, SeriesHandler,\
    SearchHandler, ChapterHandler, LogoutHandler, SeriesBookmarkHandler,\
    ChapterBookmarkHandler, ChapterProgressHandler, SettingsHandler,\
    ResetPasswordHandler


app = webapp2.WSGIApplication([
    ('/api/register', RegisterHandler),
    ('/api/login', LoginHandler),
    ('/api/logout', LogoutHandler),
    ('/api/reset-password', ResetPasswordHandler),
    ('/api/settings', SettingsHandler),
    ('/api/series', SeriesHandler),
    ('/api/chapter', ChapterHandler),
    ('/api/search', SearchHandler),
    ('/api/series-bookmark', SeriesBookmarkHandler),
    ('/api/chapter-bookmark', ChapterBookmarkHandler),
    ('/api/chapter-progress', ChapterProgressHandler),
], debug=True)
