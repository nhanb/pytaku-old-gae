import sys
sys.path.insert(0, 'lib')
import webapp2
from pytaku.api.api import UserHandler, LoginHandler, TitleHandler,\
    SearchHandler, ChapterHandler, TestTokenHandler, LogoutHandler,\
    ReadListHandler, BookmarkHandler


app = webapp2.WSGIApplication([
    ('/api/user', UserHandler),
    ('/api/auth', LoginHandler),
    ('/api/logout', LogoutHandler),
    ('/api/title', TitleHandler),
    ('/api/chapter', ChapterHandler),
    ('/api/search', SearchHandler),
    ('/api/test-token', TestTokenHandler),
    ('/api/read-list', ReadListHandler),
    ('/api/bookmarks', BookmarkHandler),
], debug=True)
