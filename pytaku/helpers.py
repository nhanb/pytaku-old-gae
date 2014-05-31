import re


def validate_email(email_addr):
    email_regex = r'^\w+(\.\w+)*@[\da-z-]+(\.[\da-z-]+)*(\.[a-z]{2,5})$'
    return bool(re.match(email_regex, email_addr, flags=re.IGNORECASE))


# Alphanumeric, may contain "_" or "," or "-", at least 3 chars
def validate_name(name):
    return bool(re.match(r'^[\w ,-]{3,}$', name))

# Web frontend (JS) should take care of more complex sanitization for rant
# title, content, etc. For now there's no rant sharing feature yet so it's not
# an issue.
