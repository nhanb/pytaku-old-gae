import re


def integer(value):
    if isinstance(value, int):
        return True, value
    return False, 'invalid_int'


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
