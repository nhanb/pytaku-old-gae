import json
from pytaku.models import User
import validators


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
def unpack_post(**fields):
    def wrap(func):
        def wrapped(handler):
            try:
                req_data = json.loads(handler.request.body)
            except ValueError:
                return True, {'data': handler.request.body}
                return False, {'msg': 'malformed_request'}

            return _process_fields(fields, req_data, handler, func)
        return wrapped
    return wrap


# Similar to unpack_post, but using GET params in URL instead of POST body
def unpack_get(**fields):
    def wrap(func):
        def wrapped(handler):
            return _process_fields(fields, handler.request, handler, func)
        return wrapped
    return wrap


# Common functionality of unpack_get() & unpack_post()
# Examples of `fields`:
#       @unpack_get(
#           email=['ustring', 'email'],
#           password=['ustring']
#       )
def _process_fields(fields, source, handler, func):
    data = {}
    invalid_fields = {}

    for field, validations in fields.iteritems():
        value = source.get(field, None)

        if value is None:
            invalid_fields[field] = 'not_found'
            continue

        for validator_name in validations:
            validator = getattr(validators, validator_name, None)

            if validator is None:
                invalid_fields[field] = 'unknown_validator'
                continue

            success, val = validator(value)
            if success:
                data[field] = val
            else:
                invalid_fields[field] = val

    if invalid_fields:
        return False, {
            'msg': 'invalid_fields',
            'invalid_fields': invalid_fields
        }

    handler.data = data
    return func(handler)
