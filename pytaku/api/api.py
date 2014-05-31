import webapp2
import json
from pytaku.models import User, Rant
from pytaku.helpers import validate_email, validate_name


def auth(func):

    def wrapped(handler):
        email = handler.request.headers.get('X-Dear-Vanna-Email')
        token = handler.request.headers.get('X-Dear-Vanna-Token')
        if not (email and token):
            return True, {'msg': 'auth_headers_not_found'}

        user, msg = User.auth_with_token(email, token)
        if user:
            handler.user = user
            return func(handler)
        else:
            return False, {'msg': msg}

    return wrapped


# Wrap data from server to proper JSON format for response body
def wrap_json(func):
    def wrapped(handler):
        success, resp_body = func(handler)
        resp_body['success'] = success
        if hasattr(handler, 'extra_vals'):
            resp_body.update(handler.extra_vals)

        handler.response.headers['Content-Type'] = 'application/json'
        handler.response.write(json.dumps(resp_body))

    return wrapped


# Get data fields from request, check if all required fields are present
def unpack_json(*fields):
    def wrap(func):
        def wrapped(handler):
            try:
                req_data = json.loads(handler.request.body)
            except ValueError:
                return True, {'data': handler.request.body}
                return False, {'msg': 'malformed_request'}

            data = {}
            fields_not_found = []

            for field in fields:
                data[field] = req_data.get(field, None)
                if data[field] is None:
                    fields_not_found.append(field)

            if fields_not_found:
                return False, {
                    'msg': 'required_fields_not_found',
                    'fields_not_found': fields_not_found
                }

            handler.data = data
            return func(handler)
        return wrapped
    return wrap


class LoginHandler(webapp2.RequestHandler):

    @wrap_json
    @unpack_json('email', 'password')
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
    @unpack_json('name', 'email', 'password')
    def post(self):
        email = self.data['email']
        password = self.data['password']
        name = self.data['name']

        if not validate_email(email):
            return False, {'msg': 'invalid_email'}

        if not validate_name(name):
            return True, {'msg': 'invalid_name'}

        new_user = User.create(email, password, name)
        return True, {
            'id': new_user.key.id(),
            'msg': 'user_created',
            'token': new_user.api_token,
        }


class RantsHandler(webapp2.RequestHandler):

    @wrap_json
    @unpack_json('category', 'title', 'content')
    @auth
    def post(self):
        category = self.data['category']
        title = self.data['title']
        content = self.data['content']
        rant = Rant.create(category, title, content, self.user)
        return True, {
            'msg': 'rant_created',
            'id': rant.key.id()
        }

    @wrap_json
    @auth
    def get(self):
        rants = Rant.getByUser(self.user)

        if rants is not None:
            return True, [{
                'content': rant.content,
                'title': rant.title,
                'category': rant.category,
                'created': str(rant.created),
            } for rant in rants]

        else:
            return False, {'msg': 'rants_not_found'}


class RantHandler(webapp2.RequestHandler):

    @wrap_json
    @auth
    def get(self):
        rant_id = int(self.request.path.split('/')[-1])
        rant = Rant.getById(rant_id, self.user)
        if rant is not None:
            return True, {
                'content': rant.content,
                'title': rant.title,
                'category': rant.category,
                'created': str(rant.created),
            }
        else:
            return False, {'msg': 'rant_not_found'}
