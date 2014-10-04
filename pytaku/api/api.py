from threading import Thread
from Queue import Queue
import webapp2
from pytaku.models import User, createUser, Chapter, Series
from pytaku import sites
from pytaku.controllers import create_or_get_series, create_or_get_chapter
from decorators import wrap_json, unpack_post, unpack_get, auth
from exceptions import PyError
from token import gen_token


class LoginHandler(webapp2.RequestHandler):

    @wrap_json
    @unpack_post(email=['ustring', 'email'],
                 password=['ustring'],
                 remember=['boolean'])
    def post(self):
        email = self.data['email']
        password = self.data['password']
        user = User.auth_with_password(email, password)
        expires = not self.data['remember']

        if user:
            return {'token': gen_token(user, expires=expires)}
        else:
            raise PyError({'msg': 'invalid_password'})


class LogoutHandler(webapp2.RequestHandler):

    @wrap_json
    @auth()
    def post(self):
        self.user.logout()
        return {}


class RegisterHandler(webapp2.RequestHandler):

    @wrap_json
    @unpack_post(email=['ustring', 'email'], password=['ustring'])
    def post(self):
        email = self.data['email']
        password = self.data['password']

        new_user = createUser(email, password)
        if new_user is None:
            raise PyError({'msg': 'existing_email'})
        return {
            'token': gen_token(new_user)
        }


class SeriesHandler(webapp2.RequestHandler):

    @wrap_json
    @auth(required=False)
    @unpack_get(url=['ustring', 'urlencoded'], chapter_limit=['integer'])
    def get(self):

        series = create_or_get_series(self.data['url'])

        resp = {
            field: getattr(series, field)
            for field in ('site', 'name', 'thumb_url', 'tags', 'status',
                          'description')
        }

        # If the provided chapter_limit is valid, return only that many
        # chapters in API response.
        chapters = series.chapters
        chapter_limit = self.data['chapter_limit']
        if chapter_limit in range(len(chapters)):
            chapters = chapters[:chapter_limit]
        resp['chapters'] = chapters

        # If user is logged in, tell if this series is in their bookmarks
        if hasattr(self, 'user'):
            resp['is_bookmarked'] = series.is_bookmarked_by(self.user)

        return resp


class SearchHandler(webapp2.RequestHandler):

    @wrap_json
    @unpack_get(keyword=['ustring'])
    def get(self):
        keyword = self.data['keyword']
        search_results = {}  # {order: [series, series, ...]}

        def _search(queue):
            keyword, site, order = queue.get()
            series_list = site.search_series(keyword)
            search_results[order] = series_list
            queue.task_done()

        q = Queue()

        for order, site in enumerate(sites.available_sites):
            q.put((keyword, site, order))
            worker = Thread(target=_search, args=(q,))
            worker.setDaemon(True)
            worker.start()

        q.join()

        # Get ordered list of series results
        series = []
        for i in sorted(search_results):
            series.extend(search_results[i])
        return series


class ChapterHandler(webapp2.RequestHandler):

    @wrap_json
    @auth(required=False)
    @unpack_get(url=['ustring', 'urlencoded'])
    def get(self):
        chapter = create_or_get_chapter(self.data['url'])

        resp = {
            'name': chapter.name,
            'url': chapter.url,
            'pages': chapter.pages,
            'series_url': chapter.series_url,
            'series_name': chapter.series_name,
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


class SeriesBookmarkHandler(webapp2.RequestHandler):

    @wrap_json
    @auth()
    def get(self):
        series = [create_or_get_series(url, no_update=True)
                  for url in self.user.bookmarked_series]
        return [{
            'site': s.site,
            'name': s.name,
            'url': s.url,
            'thumb_url': s.thumb_url,
        } for s in series]

    @wrap_json
    @unpack_post(url=['ustring'], action=['ustring'])
    @auth()
    def post(self):
        "Add or remove series from provided URL to bookmark list"

        if self.data['action'] not in ('add', 'remove'):
            raise PyError({'msg': 'invalid_action'})

        series = Series.get_by_url(self.data['url'])
        if series is None:
            raise PyError({'msg': 'series_not_created'})

        if self.data['action'] == 'add':
            if not self.user.bookmark_series(series):
                raise PyError({'msg': 'series_already_bookmarked'})
            return {}

        else:
            if not self.user.unbookmark_series(series):
                raise PyError({'msg': 'series_not_bookmarked'})
            return {}


class ChapterBookmarkHandler(webapp2.RequestHandler):

    @wrap_json
    @auth()
    def get(self):
        chapters = [create_or_get_chapter(url)
                    for url in self.user.bookmarked_chapters]
        return [{
            'series_url': chapter.series_url,
            'series_name': chapter.series_name,
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
            if not self.user.bookmark_chapter(chapter):
                raise PyError({'msg': 'chapter_already_bookmarked'})
            return {}

        else:
            if not self.user.unbookmark_chapter(chapter):
                raise PyError({'msg': 'chapter_not_bookmarked'})
            return {}
