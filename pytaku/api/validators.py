import re
from urllib import unquote


def integer(value):
    try:
        value = int(value)
        return True, value
    except ValueError:
        return False, 'invalid_int'


# Either 1 or 0
def boolean(value):
    if value == '1':
        return True, True
    elif value == '0':
        return True, False
    return False, 'invalid_bool'


def ustring(value):
    if (isinstance(value, unicode) or isinstance(value, str)) \
            and len(value) > 0:
        return True, unicode(value)
    return False, 'invalid_ustring'


def email(val):
    email_regex = r'^\w+(\.\w+)*@[\da-z-]+(\.[\da-z-]+)*(\.[a-z]{2,5})$'
    val = val.lower()
    if bool(re.match(email_regex, val)):
        return True, val
    return False, 'invalid_email'


def urlencoded(val):
    return True, unquote(val)
