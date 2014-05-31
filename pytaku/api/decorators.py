import json
from pytaku.models import User


def auth(func):

    def wrapped(handler):
        email = handler.request.headers.get('X-Email')
        token = handler.request.headers.get('X-Token')
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


# Get data fields from request, check if all required fields are present.
# All fields are JSON encoded in the POST body
def unpack_post(*fields):
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


# Similar to unpack_post, but using GET params in URL instead of POST body
def unpack_get(*fields):
    def wrap(func):
        def wrapped(handler):
            data = {}
            fields_not_found = []

            for field in fields:
                data[field] = handler.request.get(field, None)
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
