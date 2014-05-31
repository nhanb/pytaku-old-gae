import re


def validate_email(email_addr):
    email_regex = r'^\w+(\.\w+)*@[\da-z-]+(\.[\da-z-]+)*(\.[a-z]{2,5})$'
    return bool(re.match(email_regex, email_addr, flags=re.IGNORECASE))
