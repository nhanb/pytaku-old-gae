import webapp2
from pytaku.models import User, createUser, Chapter
from pytaku import sites
from decorators import wrap_json, unpack_post, unpack_get, auth
from datetime import datetime
from exceptions import PyError


class LoginHandler(webapp2.RequestHandler):

    @wrap_json
    @unpack_post(email=['ustring', 'email'], password=['ustring'])
    def post(self):
        email = self.data['email']
        password = self.data['password']
        user = User.auth_with_password(email, password)
        if user:
            return {'token': user.api_token}
        else:
            raise PyError({'msg': 'invalid_password'})


class UserHandler(webapp2.RequestHandler):

    @wrap_json
    @unpack_post(email=['ustring', 'email'], password=['ustring'])
    def post(self):
        email = self.data['email']
        password = self.data['password']

        new_user = createUser(email, password)
        if new_user is None:
            raise PyError({'msg': 'existing_email'})
        return {
            'id': new_user.key.id(),
            'msg': 'user_created',
            'token': new_user.api_token,
        }


class TitleHandler(webapp2.RequestHandler):

    @wrap_json
    @unpack_get(url=['ustring', 'urlencoded'])
    def get(self):
        url = self.data['url']

        # Check if this url is supported
        site = sites.get_site(url)
        if site is None:
            raise PyError({'msg': 'unsupported_url'})
        title_page = site.fetch_manga_seed_page(url)
        title = site.title_info(title_page)

        return {
            'site': site.netloc,
            'name': title['name'],
            'thumb_url': title['thumbnailUrl'],
            'chapters': title['chapters'],
        }


class SearchHandler(webapp2.RequestHandler):

    @wrap_json
    @unpack_get(keyword=['ustring'])
    def get(self):
        keyword = self.data['keyword']
        titles = []

        for site in sites.available_sites:
            titles.extend(site.search_titles(keyword))

        return titles


class ChapterHandler(webapp2.RequestHandler):

    @wrap_json
    @unpack_get(url=['ustring', 'urlencoded'])
    def get(self):
        url = self.data['url']

        # Check if this url is supported
        site = sites.get_site(url)
        if site is None:
            raise PyError({'msg': 'unsupported_url'})

        chapter = Chapter.getByUrl(url)

        if chapter is None or (datetime.now() - chapter.created).days < 3:
            page_html = site.fetch_chapter_seed_page(url)
            chapter_pages = site.chapter_pages(page_html)
            pages = [page['url'] for page in chapter_pages]
            if chapter is None:
                chapter = Chapter.create(url, pages)
            else:
                chapter.pages = pages

        return chapter.pages
