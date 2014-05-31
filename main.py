import sys
sys.path.insert(0, 'lib')
import webapp2
from pytaku.api.api import UserHandler, LoginHandler, TitleHandler


app = webapp2.WSGIApplication([
    ('/api/user', UserHandler),
    ('/api/auth', LoginHandler),
    ('/api/title', TitleHandler),
], debug=True)
