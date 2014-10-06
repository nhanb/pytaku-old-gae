from datetime import datetime
from pytaku.config import secret
from pytaku.models import User
from itsdangerous import URLSafeSerializer, BadSignature
from google.appengine.api.app_identity import get_application_id

_secret_str = secret[get_application_id()]
_signer = URLSafeSerializer(_secret_str)
_datetimefmt = '%Y-%m-%d.%H:%M:%S'


def gen_token(user, expires=True):
    data = {
        'id': user.key.id(),
        'hash': user.password_hash,
    }
    if expires:
        data['created_at'] = datetime.now().strftime(_datetimefmt)

    return _signer.dumps(data)


def validate_token(message, max_days=None):
    try:
        data = _signer.loads(message)
    except BadSignature:
        return None, 'invalid_token'

    # Tokens without creation time don't expire over time
    if 'created_at' in data:
        token_created_at = datetime.strptime(data['created_at'], _datetimefmt)
        if (datetime.now() - token_created_at).days > max_days:
            return None, 'expired_token'

    user = User.get_by_id(data['id'])
    if user is None:
        return None, 'invalid_token'

    # All existing tokens expire when user password has been changed
    if user.password_hash != data['hash']:
        return None, 'expired_token'

    return user, None
