import sys
sys.path.insert(0, 'lib')
import webapp2
from pytaku.api.api import UserHandler, LoginHandler


app = webapp2.WSGIApplication([
    ('/api/users', UserHandler),
    ('/api/auth', LoginHandler),
], debug=True)
