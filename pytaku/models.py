from google.appengine.ext import ndb
from passlib.hash import pbkdf2_sha512
from datetime import datetime, timedelta
import uuid


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
    authors = ndb.StringProperty(repeated=True)

    def is_bookmarked_by(self, user):
        return self.url in user.bookmarked_series

    def is_fresh(self):
        # fresh == updated no longer than 12 hours ago
        delta = datetime.now() - self.last_update
        return delta.days <= 0 and delta.seconds <= 43200

    @classmethod
    def create(cls, url, site, name, thumb_url, chapters, status, tags, desc,
               authors=[]):
        obj = cls(url=url, site=site, name=name, thumb_url=thumb_url,
                  chapters=chapters, status=status, tags=tags,
                  description=desc, authors=authors)
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

    # user settings
    language = ndb.StringProperty(default=u'en')  # use ISO 639-1 language code
    enable_shortcut = ndb.BooleanProperty(default=False)

    reset_pw_token = ndb.StringProperty(indexed=True)
    reset_pw_exp = ndb.DateTimeProperty()

    @property
    def settings(self):
        return {
            'language': self.language,
            'enable_shortcut': self.enable_shortcut,
        }

    def verify_password(self, password):
        return pbkdf2_sha512.verify(password, self.password_hash)

    def logout(self):
        self.api_token = None
        self.put()

    @classmethod
    def generate_reset_password_token(cls, email):
        user = cls.get_by_id(email)
        if user is None:
            return None

        user.reset_pw_token = unicode(uuid.uuid1())
        user.reset_pw_exp = datetime.now() + timedelta(hours=12)
        user.put()
        return user.reset_pw_token

    @classmethod
    def set_new_password(cls, token, password):
        user = cls.query(cls.reset_pw_token == token,
                         cls.reset_pw_exp > datetime.now()).get()
        if user is None:
            return False

        user.password_hash = cls.hash_password(password)
        user.reset_pw_exp = None
        user.reset_pw_token = None
        user.put()
        return True

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

    def chapter_progress(self, chapter_url):
        return ChapterProgress.get_single(self.key.id(), chapter_url)

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


class ChapterProgress(ndb.Model):
    email = ndb.StringProperty()
    chapter_url = ndb.StringProperty()
    series_url = ndb.StringProperty()
    finished = ndb.BooleanProperty(default=False)

    UNREAD = 'unread'
    READING = 'reading'
    FINISHED = 'finished'

    @classmethod
    def set_progress(cls, email, progress, chapter_url, series_url):
        record = cls.query(cls.email == email,
                           cls.chapter_url == chapter_url).get()
        if record is None:
            if progress == cls.UNREAD:
                return
            record = cls(email=email, chapter_url=chapter_url,
                         series_url=series_url)

        if progress == cls.UNREAD:
            record.key.delete()
            return

        if progress == cls.READING:
            record.finished = False
        elif progress == cls.FINISHED:
            record.finished = True
        record.put()

    @classmethod
    def get_single(cls, email, chapter_url):
        record = cls.query(cls.email == email,
                           cls.chapter_url == chapter_url).get()
        if record is None:
            return cls.UNREAD
        if record.finished:
            return cls.FINISHED
        return cls.READING

    @classmethod
    def get_by_series_url(cls, email, series_url):
        results = cls.query(cls.email == email,
                            cls.series_url == series_url).fetch()
        return {
            r.chapter_url: cls.FINISHED if r.finished else cls.READING
            for r in results
        }
