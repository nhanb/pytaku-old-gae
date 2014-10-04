from google.appengine.ext import ndb
from passlib.hash import pbkdf2_sha512
from datetime import datetime


class Series(ndb.Model):
    url = ndb.StringProperty(indexed=True)
    name = ndb.StringProperty()
    site = ndb.StringProperty()
    thumb_url = ndb.StringProperty()
    last_update = ndb.DateTimeProperty(auto_now_add=True)
    chapters = ndb.JsonProperty()  # [{'name': 'Ch.101', 'url': 'http...'}]
    tags = ndb.StringProperty(repeated=True)
    status = ndb.StringProperty()  # ongoing/completed/unknown
    description = ndb.StringProperty(repeated=True, indexed=False)

    def is_bookmarked_by(self, user):
        return self.url in user.bookmarked_series

    def is_fresh(self):
        # fresh == updated no longer than 1 day ago
        return (datetime.now() - self.last_update).days <= 1

    @classmethod
    def create(cls, url, site, name, thumb_url, chapters, status, tags, desc):
        obj = cls(url=url, site=site, name=name, thumb_url=thumb_url,
                  chapters=chapters, status=status, tags=tags,
                  description=desc)
        obj.put()
        return obj

    @classmethod
    def get_by_url(cls, url):
        return cls.query(cls.url == url).get()


class Chapter(ndb.Model):
    url = ndb.StringProperty(indexed=True)
    name = ndb.StringProperty(indexed=True)
    pages = ndb.JsonProperty()
    created = ndb.DateTimeProperty(auto_now_add=True)
    next_chapter_url = ndb.StringProperty()
    prev_chapter_url = ndb.StringProperty()

    series_url = ndb.StringProperty()
    series_name = ndb.StringProperty()

    def is_bookmarked(self, user):
        return self.url in user.bookmarked_chapters

    @classmethod
    def create(cls, url, name, pages, series_url, series_name, prev, next):
        obj = cls(url=url, name=name, pages=pages, series_url=series_url,
                  series_name=series_name, prev_chapter_url=prev,
                  next_chapter_url=next)
        obj.put()
        return obj

    @classmethod
    def get_by_url(cls, url):
        return cls.query(cls.url == url).get()

    @classmethod
    def set_series_name(cls, series_url, series_name):
        chapters = cls.query(cls.series_url == series_url)
        for chapter in chapters:
            chapter.series_name = series_name
            chapter.put()


# Email is stored as id to ensure uniqueness
class User(ndb.Model):
    password_hash = ndb.StringProperty()
    last_login = ndb.DateTimeProperty(auto_now_add=True)
    bookmarked_series = ndb.StringProperty(repeated=True)
    bookmarked_chapters = ndb.StringProperty(repeated=True)

    def verify_password(self, password):
        return pbkdf2_sha512.verify(password, self.password_hash)

    def logout(self):
        self.api_token = None
        self.put()

    def _bookmark(self, record, name):
        list_name = 'bookmarked_' + name
        if record.url not in getattr(self, list_name):
            getattr(self, list_name).append(record.url)
            self.put()
            return True
        return False

    def _unbookmark(self, record, name):
        list_name = 'bookmarked_' + name
        if record.url in getattr(self, list_name):
            getattr(self, list_name).remove(record.url)
            self.put()
            return True
        return False

    def bookmark_series(self, series):
        return self._bookmark(series, 'series')

    def unbookmark_series(self, series):
        return self._unbookmark(series, 'series')

    def bookmark_chapter(self, chapter):
        return self._bookmark(chapter, 'chapters')

    def unbookmark_chapter(self, chapter):
        return self._unbookmark(chapter, 'chapters')

    @staticmethod
    def hash_password(password):
        return pbkdf2_sha512.encrypt(password)

    @classmethod
    def auth_with_password(cls, email, password):
        user = cls.get_by_id(email)
        if user is not None and user.verify_password(password):
            user.last_login = datetime.now()
            user.put()
            return user
        else:
            return None

    @classmethod
    def auth_with_token(cls, email, token):
        user = cls.get_by_id(email)
        if user is None or user.api_token is None or user.api_token != token:
            return None, 'invalid_token'
        if (datetime.now() - user.last_login).days > 30:
            return None, 'expired_token'
        return user, None


@ndb.transactional
def createUser(email, password):
    existing = User.get_by_id(email)
    if existing is not None:
        return None

    user = User(id=email, password_hash=User.hash_password(password))
    user.put()
    return user
