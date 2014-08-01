import webapp2
from pytaku.models import User, createUser, Chapter, Title
from pytaku import sites
from decorators import wrap_json, unpack_post, unpack_get, auth
from exceptions import PyError
from google.appengine.ext import ndb


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


class LogoutHandler(webapp2.RequestHandler):

    @wrap_json
    @auth()
    def post(self):
        self.user.logout()
        return {}


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
            'token': new_user.api_token,
        }


class TitleHandler(webapp2.RequestHandler):

    @wrap_json
    @auth(required=False)
    @unpack_get(url=['ustring', 'urlencoded'], chapter_limit=['integer'])
    def get(self):
        url = self.data['url']

        # Check if this url is supported
        site = sites.get_site(url)
        if site is None:
            raise PyError({'msg': 'unsupported_url'})

        # Check if title is already in db
        title_record = Title.get_by_url(url)

        # Skip reloading title info if updated recently
        if title_record and title_record.is_fresh():
            limit = self.data['chapter_limit']
            if limit < 1:
                limit = None
            chapters = title_record.chapters[:limit]
            resp = {
                'site': site.netloc,
                'name': title_record.name,
                'thumb_url': title_record.thumb_url,
                'chapters': [{'name': c['name'], 'url': c['url']}
                             for c in chapters]
            }
            if hasattr(self, 'user'):
                user = self.user
                resp['is_in_read_list'] = title_record.is_in_read_list(user)
            return resp

        # =============== Create/Update title record ====================

        # Fetch basic title info (name, thumburl, chapter list)
        title_page = site.fetch_manga_seed_page(url)
        title = site.title_info(title_page)

        # Create new title if not in db yet
        if title_record is None:
            title_record = Title.create(url, site.netloc, title['name'],
                                        title['thumbnailUrl'],
                                        title['chapters'])
        else:
            title_record.update(site.netloc, title['name'],
                                title['thumbnailUrl'], title['chapters'])

        # If the provided chapter_limit is valid, return only that many
        # chapters in API response.
        chapters = title['chapters']
        chapter_limit = self.data['chapter_limit']
        if chapter_limit in range(len(chapters)):
            chapters = chapters[:chapter_limit]

        resp = {
            'site': site.netloc,
            'name': title['name'],
            'thumb_url': title['thumbnailUrl'],
            'chapters': chapters,
        }

        if hasattr(self, 'user'):
            resp['is_in_read_list'] = title_record.is_in_read_list(self.user)

        return resp


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
    @auth(required=False)
    @unpack_get(url=['ustring', 'urlencoded'])
    def get(self):
        url = self.data['url']

        # Check if this url is supported
        site = sites.get_site(url)
        if site is None:
            raise PyError({'msg': 'unsupported_url'})

        chapter = Chapter.get_by_url(url)
        if chapter is None:
            page_html = site.fetch_chapter_seed_page(url)
            info = site.chapter_info(page_html)
            chapter = Chapter.create(url, info['name'], info['pages'],
                                     info['title_url'],
                                     info['prev_chapter_url'],
                                     info['next_chapter_url'])
            chapter.put()

        resp = {
            'name': chapter.name,
            'url': chapter.url,
            'pages': [p['url'] for p in chapter.pages],
            'title_url': chapter.title_url,
            'next_chapter_url': chapter.next_chapter_url,
            'prev_chapter_url': chapter.prev_chapter_url,
        }

        if hasattr(self, 'user'):
            user = self.user
            resp['is_bookmarked'] = chapter.is_bookmarked(user)

        return resp


class TestTokenHandler(webapp2.RequestHandler):
    @wrap_json
    @auth()
    def get(self):
        return {}


class ReadListHandler(webapp2.RequestHandler):

    @wrap_json
    @auth()
    def get(self):
        titles = [title_key.get() for title_key in self.user.read_list]
        return [{
            'site': title.site,
            'name': title.name,
            'url': title.url,
        } for title in titles]

    @wrap_json
    @unpack_post(url=['ustring'], action=['ustring'])
    @auth()
    def post(self):
        "Add or remove title from provided URL to read list"

        if self.data['action'] not in ('add', 'remove'):
            raise PyError({'msg': 'invalid_action'})

        title = Title.get_by_url(self.data['url'])
        if title is None:
            raise PyError({'msg': 'title_not_created'})

        if self.data['action'] == 'add':
            if not self.user.add_to_read_list(title):
                raise PyError({'msg': 'title_already_in_read_list'})
            return {}

        else:
            if not self.user.remove_from_read_list(title):
                raise PyError({'msg': 'title_already_in_read_list'})
            return {}


class BookmarkHandler(webapp2.RequestHandler):

    @wrap_json
    @auth()
    def get(self):
        chapters = [b.get() for b in self.user.bookmarks]
        return [{
            'title_url': chapter.title_url,
            'name': chapter.name,
            'url': chapter.url,
        } for chapter in chapters]

    @wrap_json
    @unpack_post(url=['ustring'], action=['ustring'])
    @auth()
    def post(self):
        "Add or remove chapter from provided URL to bookmark list"

        if self.data['action'] not in ('add', 'remove'):
            raise PyError({'msg': 'invalid_action'})

        chapter = Chapter.get_by_url(self.data['url'])
        if chapter is None:
            raise PyError({'msg': 'chapter_not_created'})

        if self.data['action'] == 'add':
            if not self.user.add_to_bookmarks(chapter):
                raise PyError({'msg': 'chapter_already_in_bookmarks'})
            return {}

        else:
            if not self.user.remove_from_bookmarks(chapter):
                raise PyError({'msg': 'chapter_not_in_bookmarks'})
            return {}
