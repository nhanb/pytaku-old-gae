import re
from Crypto.Hash import SHA256
from Crypto.Cipher import AES
from base64 import b64decode

# Ported from unobfuscated wrapKA function:
# https://gist.github.com/nhanb/74542c36d3dcc5dde4e90b34437fb523

_iv = 'a5e8e2e9c2721be0a84ad660c472c1f3'.decode('hex')


def _generate_sha(plaintext):
    sha = SHA256.new()
    sha.update(plaintext)
    return sha.digest()


# original one found in io.js:
_default_key = _generate_sha('mshsdf832nsdbash20asdm')


def decode_url(input, key):
    encoded = b64decode(input)
    dec = AES.new(key=key, mode=AES.MODE_CBC, IV=_iv)
    result = dec.decrypt(encoded)
    unpadded = result[:-ord(result[-1])]
    return unicode(unpadded)


def _crypto_tag(tag):
    return tag.name == 'script' and tag.text and 'chko' in tag.text


def get_key(soup):

    crypto_tag = soup.find(_crypto_tag)
    if crypto_tag is None:
        return _default_key

    pat = re.compile('\["(.+)"\]')
    keys = pat.findall(crypto_tag.text)
    if len(keys) > 0:
        unhashed_key = keys[-1].decode('string_escape')
        return _generate_sha(unhashed_key)
    else:
        return _default_key
