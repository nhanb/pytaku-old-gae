import webapp2
from pytaku.models import User, createUser, Title, Chapter
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
    @unpack_get(url=['ustring', 'urlencoded'], update=['boolean'])
    @auth
    def get(self):
        url = self.data['url']
        existing_title = Title.getByUrl(url)
        if existing_title is not None and not self.data['update']:
            return True, {
                'site': existing_title.site,
                'name': existing_title.name,
                'url': existing_title.url,
                'full': True,
                'chapters': existing_title.getChapters(),
                'created': str(existing_title.created),
            }

        # ------------ Fetch latest version of title ---------

        # Check if this url is supported
        site = sites.get_site(url)
        if site is None:
            return False, {'msg': 'unsupported_url'}

        title_page = site.fetch_manga_seed_page(url)
        title_info = site.title_info(title_page)
        chapters = title_info['chapters']
        thumb_url = title_info['thumbnailUrl']
        tags = title_info['tags']
        name = title_info['name']

        # This is a brand new title and (update == True or update == False)
        if existing_title is None:
            title = Title.create(site, name, url, thumb_url, tags, chapters)
            return True, {
                'site': title.site,
                'name': title.name,
                'url': title.url,
                'full': False,
                'created': str(title.created),
            }

        # Only possiblity left: this is an existing title and update == True
        # => Look for this title's new chapters
        for chapter in chapters:
            existing_chapter = Chapter.getByUrl(chapter['url'])



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
