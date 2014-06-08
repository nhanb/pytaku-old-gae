import urllib
from google.appengine.api import urlfetch
import re
from bs4 import BeautifulSoup
from pytaku.sites import Site


class Kissmanga(Site):

    netloc = 'kissmanga.com'

    # Return a list of dictionaries that store at least name and url:
    # [ { 'name': 'Naruto', 'url': 'http://...' }, {...}, ... ]
    def search_titles(self, keyword):
        url = 'http://kissmanga.com/Search/SearchSuggest'
        params = {
            'type': 'Manga',
            'keyword': keyword,
        }
        payloads = urllib.urlencode(params)
        resp = urlfetch.fetch(url, payload=payloads, method='POST')

        if resp.status_code != 200:
            return 'screwed'

        # Kissmanga returns manga titles and links in xml format
        soup = BeautifulSoup(resp.content)
        atags = soup.find_all('a')
        return [{'name': a.string.strip(),
                 'url': a['href'],
                 'site': 'kissmanga'} for a in atags]

    # All kinds of data
    # - name "Naruto"
    # - chapters [{name, url}, {}, ...] - latest first
    # - thumbnailUrl "url"
    # - tags [tag1, tag2, ...]
    def title_info(self, html):
        soup = BeautifulSoup(html)
        chapters = self._chapters(soup)
        thumbnailUrl = self._thumbnail_url(soup)
        tags = self._tags(soup)
        name = self._name(soup)
        return {'chapters': chapters,
                'thumbnailUrl': thumbnailUrl,
                'tags': tags,
                'name': name}

    def _chapters(self, soup):
        table = soup.find('table', class_='listing')
        return [{'url': 'http://kissmanga.com' + a['href'],
                'name': a.string.strip()}
                for a in table.find_all('a')]

    def _thumbnail_url(self, soup):
        return soup.find('link', {'rel': 'image_src'})['href']

    def _tags(self, soup):
        tags = soup.find('span', text='Genres:').find_next_siblings('a')
        return [text.string.lower() for text in tags]

    def _name(self, soup):
        # <link rel='alternate' title='Naruto manga' ...
        # => must remove the ' manga' part
        return soup.find('link', {'rel': 'alternate'})['title'][:-6]

    # Pages from a chapter: [{ 'filename': '...', 'url': '...' }]
    def chapter_pages(self, html):
        pat = re.compile('lstImages\.push\("(.+?)"\);')
        matches = pat.findall(html)
        pages = []
        name_pat = '.*([0-9]{3}\.[a-zA-Z]+)\?.*'
        for url in matches:
            filename = re.match(name_pat, url).group(1)
            pages.append({'filename': filename, 'url': url})
        return pages

    def fetch_manga_seed_page(self, url):
        header = {'Cookie': 'vns_Adult=yes'}
        return self.get_html(url, headers=header)
