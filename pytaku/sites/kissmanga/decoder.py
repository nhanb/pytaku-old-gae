import re
from Crypto.Hash import SHA256
from Crypto.Cipher import AES
from base64 import b64decode

# Ported from unobfuscated wrapKA function:
# https://gist.github.com/nhanb/74542c36d3dcc5dde4e90b34437fb523

iv = 'a5e8e2e9c2721be0a84ad660c472c1f3'.decode('hex')


def decode_url(input, unhashed_key):
    sha = SHA256.new()
    sha.update(unhashed_key)
    key = sha.digest()

    encoded = b64decode(input)
    dec = AES.new(key=key, mode=AES.MODE_CBC, IV=iv)
    result = dec.decrypt(encoded)
    unpadded = result[:-ord(result[-1])]
    return unicode(unpadded)


def _crypto_tag(tag):
    return tag.name == 'script' and tag.text and 'chko' in tag.text


def get_unhashed_key(soup):
    default_key = 'mshsdf832nsdbash20asdm'  # original one found in io.js

    crypto_tag = soup.find(_crypto_tag)
    if crypto_tag is None:
        return default_key

    pat = re.compile('\["(.+)"\]')
    keys = pat.findall(crypto_tag.text)
    if len(keys) > 0:
        return keys[-1].decode('string_escape')
    else:
        return default_key
