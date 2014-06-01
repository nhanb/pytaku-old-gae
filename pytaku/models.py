import uuid
from google.appengine.ext import ndb
from passlib.hash import pbkdf2_sha512
from datetime import datetime


# Email is stored as id to ensure uniqueness
class User(ndb.Model):
    password_hash = ndb.StringProperty()
    api_token = ndb.StringProperty()
    last_login = ndb.DateTimeProperty(auto_now_add=True)

    def verify_password(self, password):
        return pbkdf2_sha512.verify(password, self.password_hash)

    def generate_token(self):
        self.api_token = str(uuid.uuid4())

    @staticmethod
    def hash_password(password):
        return pbkdf2_sha512.encrypt(password)

    @classmethod
    def auth_with_password(cls, email, password):
        user = cls.get_by_id(email)
        if user is not None and user.verify_password(password):
            user.generate_token()
            return user
        else:
            return None

    @classmethod
    def auth_with_token(cls, email, token):
        user = cls.get_by_id(email)
        if user is None or user.api_token != token:
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
    user.generate_token()
    user.put()
    return user


class Chapter(ndb.Model):
    url = ndb.StringProperty(indexed=True)
    pages = ndb.JsonProperty()
    created = ndb.DateTimeProperty(auto_now_add=True)

    def computeAge(self):
        now = datetime.now()
        return (now - self.created).days
    age = ndb.ComputedProperty(computeAge)

    @classmethod
    def create(cls, url, pages):
        obj = cls(url=url, pages=pages)
        obj.put()
        return obj

    @classmethod
    def getByUrl(cls, url):
        return cls.query(cls.url == url).get()
