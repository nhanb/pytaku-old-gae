import webapp2
from pytaku.models import User, createUser, Title
from pytaku.helpers import validate_email
from pytaku import sites
from decorators import wrap_json, unpack_post, unpack_get, auth


class LoginHandler(webapp2.RequestHandler):

    @wrap_json
    @unpack_post('email', 'password')
    def post(self):
        email = self.data['email']
        password = self.data['password']
        user = User.auth_with_password(email, password)
        if user:
            return True, {'token': user.api_token}
        else:
            return False, {'msg': 'invalid_password'}


class UserHandler(webapp2.RequestHandler):

    @wrap_json
    @unpack_post('email', 'password')
    def post(self):
        email = self.data['email']
        password = self.data['password']

        if not validate_email(email):
            return False, {'msg': 'invalid_email'}

        new_user = createUser(email, password)
        if new_user is None:
            return False, {'msg': 'existing_email'}

        return True, {
            'id': new_user.key.id(),
            'msg': 'user_created',
            'token': new_user.api_token,
        }


class TitleHandler(webapp2.RequestHandler):

    @wrap_json
    @unpack_get('url')
    @auth
    def get(self):
        title = Title.getByUrl(self.data['url'])
        if title is not None:
            return True, {
                'site': title.site,
                'name': title.name,
                'url': title.url,
                'created': str(title.created),
            }
        else:
            return False, {'msg': 'title_not_found'}


class SearchHandler(webapp2.RequestHandler):

    @wrap_json
    @unpack_get('keyword')
    @auth
    def get(self):
        keyword = self.data['keyword']
        titles = []

        for site in sites.available_sites:
            titles.extend(site.search_titles(keyword))

        return True, {'titles': titles}
