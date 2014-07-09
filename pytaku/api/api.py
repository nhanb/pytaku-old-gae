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
    @unpack_get(url=['ustring', 'urlencoded'])
    def get(self):
        url = self.data['url']

        # Check if this url is supported
        site = sites.get_site(url)
        if site is None:
            raise PyError({'msg': 'unsupported_url'})
        title_page = site.fetch_manga_seed_page(url)
        title = site.title_info(title_page)

        # Create new title if not in db yet
        title_record = Title.get_by_url(url)
        if title_record is None:
            title_record = Title.create(url, site.netloc, title['name'])

        # Create newest chapters first, stop at first exising chapter record
        chapters = title['chapters']
        chapter_records = []
        length = len(chapters)
        for i in range(length):
            chap_num = length - i
            chap_url = chapters[i]['url']
            chap_name = chapters[i]['name']
            existing_chapter = Chapter.get_by_url(chap_url)
            if existing_chapter is None:
                c = Chapter.create(title_record, chap_url, chap_num, chap_name)
                chapter_records.append(c)
            else:
                break

        if len(chapter_records) > 0:
            # Reverse again to have correct order (0, 1, 2...). This makes sure
            # if something wrong happens during multiple puts (request timeout,
            # etc) then we still have a contiguous list of records going from
            # zero to whatever number without any missing chapter inbetween.
            ndb.put_multi(reversed(chapter_records))

        resp = {
            'site': site.netloc,
            'name': title['name'],
            'thumb_url': title['thumbnailUrl'],
            'chapters': title['chapters'],
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
    @unpack_get(url=['ustring', 'urlencoded'])
    def get(self):
        url = self.data['url']

        # Check if this url is supported
        site = sites.get_site(url)
        if site is None:
            raise PyError({'msg': 'unsupported_url'})

        chapter = Chapter.get_by_url(url)

        if chapter is None:
            # TODO: should we create a single chapter on the fly?
            raise PyError('chapter_not_created')

        if chapter.pages is None:
            page_html = site.fetch_chapter_seed_page(url)
            chapter_pages = site.chapter_pages(page_html)
            chapter.pages = [page['url'] for page in chapter_pages]
            chapter.put()

        return {
            'name': chapter.name,
            'url': chapter.url,
            'number': chapter.number,
            'pages': chapter.pages,
            'next_chapter_url': chapter.next_chapter_url(),
            'prev_chapter_url': chapter.prev_chapter_url(),
        }


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
