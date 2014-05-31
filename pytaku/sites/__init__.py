import urlparse
from google.appengine.api import urlfetch


# Skeleton site. If a site requires special requests (custom headers, etc.)
# then the site implementation should override these methods.
class Site:

    def fetch_manga_seed_page(self, url):
        return urlfetch.fetch(url)

    def fetch_chapter_seed_page(self, url):
        return urlfetch.fetch(url)

    def fetch_page_image(self, url):
        return urlfetch.fetch(url)

from kissmanga import Kissmanga
from batoto import Batoto

available_sites = [
    Kissmanga(),
    Batoto(),
]


# Factory function, return instance of suitable "site" class from url
def get_site(url):
    netloc = urlparse.urlparse(url).netloc
    for site in available_sites:
        if netloc == site.netloc:
            return site
