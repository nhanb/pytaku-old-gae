import urlparse
from google.appengine.api import urlfetch
from pytaku.api.exceptions import PyError


# Skeleton site. If a site requires special requests (custom headers, etc.)
# then the site implementation should override these methods.
class Site:

    def get_html(self, url, **kwargs):
        resp = urlfetch.fetch(url, **kwargs)
        if resp.status_code != 200:
            raise PyError({'msg': 'external_request_fail', 'url': url})
        return resp.content

    def fetch_manga_seed_page(self, url, **kwargs):
        return self.get_html(url, **kwargs)

    def fetch_chapter_seed_page(self, url, **kwargs):
        return self.get_html(url, **kwargs)

    def fetch_page_image(self, url, **kwargs):
        return self.get_html(url, **kwargs)

from kissmanga import Kissmanga
from batoto import Batoto
from vitaku import Vitaku

available_sites = [
    Kissmanga(),
    Vitaku(),
    Batoto(),
]


# Factory function, return instance of suitable "site" class from url
def get_site(url):
    netloc = urlparse.urlparse(url).netloc
    for site in available_sites:
        if netloc in site.netlocs:
            return site
    return None
