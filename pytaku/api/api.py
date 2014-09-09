from threading import Thread
from Queue import Queue
import webapp2
from pytaku.models import User, createUser, Chapter, Series
from pytaku import sites
from decorators import wrap_json, unpack_post, unpack_get, auth
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
            'token': new_user.api_token,
        }


class SeriesHandler(webapp2.RequestHandler):

    @wrap_json
    @auth(required=False)
    @unpack_get(url=['ustring', 'urlencoded'], chapter_limit=['integer'])
    def get(self):
        url = self.data['url']

        # Check if this url is supported
        site = sites.get_site(url)
        if site is None:
            raise PyError({'msg': 'unsupported_url'})

        # Check if series is already in db
        series_record = Series.get_by_url(url)

        # Skip reloading series info if updated recently
        if series_record and series_record.is_fresh():
            limit = self.data['chapter_limit']
            if limit < 1:
                limit = None
            chapters = series_record.chapters[:limit]
            resp = {
                'site': site.netloc,
                'name': series_record.name,
                'thumb_url': series_record.thumb_url,
                'chapters': [{'name': c['name'], 'url': c['url']}
                             for c in chapters],
                'tags': series_record.tags,
                'status': series_record.status,
                'description': series_record.description,
            }
            if hasattr(self, 'user'):
                user = self.user
                resp['is_bookmarked'] = series_record.is_bookmarked_by(user)
            return resp

        # =============== Create/Update series record ====================

        # Fetch basic series info (name, thumburl, chapter list)
        series_page = site.fetch_manga_seed_page(url)
        series = site.series_info(series_page)

        # Create new series if not in db yet
        if series_record is None:
            series_record = Series.create(url,
                                          site.netloc,
                                          series['name'],
                                          series['thumbnailUrl'],
                                          series['chapters'],
                                          series['status'],
                                          series['tags'],
                                          series['description'])
        else:
            series_record.update(site.netloc,
                                 series['name'],
                                 series['thumbnailUrl'],
                                 series['chapters'],
                                 series['status'],
                                 series['tags'],
                                 series['description'])

        # If the provided chapter_limit is valid, return only that many
        # chapters in API response.
        chapters = series['chapters']
        chapter_limit = self.data['chapter_limit']
        if chapter_limit in range(len(chapters)):
            chapters = chapters[:chapter_limit]

        resp = {
            'site': site.netloc,
            'name': series['name'],
            'thumb_url': series['thumbnailUrl'],
            'chapters': chapters,
            'tags': series['tags'],
            'status': series['status'],
            'description': series['description'],
        }

        if hasattr(self, 'user'):
            resp['is_bookmarked'] = series_record.is_bookmarked_by(self.user)

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
                                     info['series_url'],
                                     info['prev_chapter_url'],
                                     info['next_chapter_url'])
            chapter.put()

        resp = {
            'name': chapter.name,
            'url': chapter.url,
            'pages': chapter.pages,
            'series_url': chapter.series_url,
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
        series = [Series.get_by_url(url) for url in self.user.bookmarked_series]
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
        chapters = [Chapter.get_by_url(url)
                    for url in self.user.bookmarked_chapters]
        return [{
            'series_url': chapter.series_url,
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
