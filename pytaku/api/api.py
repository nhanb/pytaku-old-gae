import webapp2
from pytaku.models import User, createUser
from pytaku import sites
from decorators import wrap_json, unpack_post, unpack_get, auth


class LoginHandler(webapp2.RequestHandler):

    @wrap_json
    @unpack_post(email=['ustring', 'email'], password=['ustring'])
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
    @unpack_post(email=['ustring', 'email'], password=['ustring'])
    def post(self):
        email = self.data['email']
        password = self.data['password']

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
    @unpack_get(url=['ustring', 'urlencoded'])
    @auth
    def get(self):
        url = self.data['url']

        # Check if this url is supported
        site = sites.get_site(url)
        if site is None:
            return False, {'msg': 'unsupported_url'}

        title_page = site.fetch_manga_seed_page(url)
        title = site.title_info(title_page)

        return True, {
            'site': site.netloc,
            'name': title['name'],
            'thumb_url': title['thumbnailUrl'],
            'chapters': title['chapters'],
        }


class SearchHandler(webapp2.RequestHandler):

    @wrap_json
    @unpack_get(keyword=['ustring'])
    @auth
    def get(self):
        keyword = self.data['keyword']
        titles = []

        for site in sites.available_sites:
            titles.extend(site.search_titles(keyword))

        return True, {'titles': titles}
