import urllib
from google.appengine.api import urlfetch
import re
from bs4 import BeautifulSoup
import bs4
from pytaku.sites import Site
from .decoder import decode_url, get_key


class Kissmanga(Site):

    netlocs = ['kissmanga.com']

    # Return a list of dictionaries that store at least name and url:
    # [ { 'name': 'Naruto', 'url': 'http://...' }, {...}, ... ]
    def search_series(self, keyword):
        url = 'http://kissmanga.com/Search/SearchSuggest'
        params = {
            'type': 'Manga',
            'keyword': keyword,
        }
        payloads = urllib.urlencode(params)
        resp = urlfetch.fetch(url, payload=payloads, method='POST')

        if resp.status_code != 200:
            return []  # TODO maybe show some meaningful error alert to user?

        # Kissmanga returns manga series and links in xml format
        soup = BeautifulSoup(resp.content)
        atags = soup.find_all('a')
        return [{'name': a.text.strip(),
                 'url': a['href'],
                 'site': 'kissmanga'} for a in atags]

    # All kinds of data
    # - name "Naruto"
    # - chapters [{name, url}, {}, ...] - latest first
    # - thumb_url "url"
    # - tags [tag1, tag2, ...]
    # - status "ongoing"/"completed"
    # - description ["paragraph1", "paragraph2", ...]
    # - authors ["Kishimoto Masashi", ...]
    def series_info(self, html):
        soup = BeautifulSoup(html)
        chapters = self._chapters(soup)
        thumb_url = self._thumbnail_url(soup)
        tags = self._tags(soup)
        name = self._name(soup)
        status = self._status(soup)
        description = self._description(soup)
        authors = self._authors(soup)
        return {
            'site': self.netlocs[0],
            'chapters': chapters,
            'thumb_url': thumb_url,
            'tags': tags,
            'name': name,
            'status': status,
            'description': description,
            'authors': authors,
        }

    def _chapters(self, soup):
        table = soup.find('table', class_='listing')
        return [{'url': 'http://kissmanga.com' + a['href'],
                'name': a.string.strip()}
                for a in table.find_all('a')]

    def _thumbnail_url(self, soup):
        return soup.find('link', {'rel': 'image_src'})['href']

    def _tags(self, soup):
        tags = soup.find('span', text='Genres:').find_next_siblings('a')
        return [text.string.strip().lower() for text in tags]

    def _name(self, soup):
        # <link rel='alternate' title='Naruto manga' ...
        # => must remove the ' manga' part
        return soup.find('link', {'rel': 'alternate'})['title'][:-6]

    def _status(self, soup):
        status_span = soup.find('span', {'class': 'info'}, text='Status:')
        return status_span.next_sibling.strip().lower()

    def _description(self, soup):
        desc_span = soup.find('span', {'class': 'info'}, text='Summary:')
        p_tags = desc_span.next_siblings
        desc = [s.text for s in p_tags if type(s) == bs4.element.Tag]
        return desc

    def _authors(self, soup):
        authors = soup.find('span', text='Author:').find_next_siblings('a')
        return [text.string.strip() for text in authors]

    # Chapter data
    # - name "Naruto Ch.101"
    # - pages [url1, url2, ...] - in ascending order
    # - prev_chapter_url
    # - next_chapter_url
    # - series_url
    def chapter_info(self, html, **kwargs):
        pages = self._chapter_pages(html)
        soup = BeautifulSoup(html)
        name = self._chapter_name(soup)
        series_url = self._chapter_series_url(soup)
        prev, next = self._chapter_prev_next(soup)
        return {
            'name': name,
            'pages': pages,
            'series_url': series_url,
            'next_chapter_url': next,
            'prev_chapter_url': prev,
        }

    def _chapter_prev_next(self, soup):
        next = soup.find('img', class_='btnNext')
        if next is not None:
            next = next.parent['href']
        prev = soup.find('img', class_='btnPrevious')
        if prev is not None:
            prev = prev.parent['href']
        return prev, next

    def _chapter_name(self, soup):
        select = soup.find('select', class_='selectChapter')
        return select.find('option', selected=True).text.strip()

    def _chapter_pages(self, html):
        soup = BeautifulSoup(html)
        key = get_key(soup)

        pat = re.compile('lstImages\.push\(wrapKA\("(.+?)"\)\);')
        encrypted_urls = pat.findall(html)
        return [decode_url(url, key) for url in encrypted_urls]

    def _chapter_series_url(self, soup):
        a_tag = soup.find('div', id='navsubbar').find('p').find('a')
        return a_tag['href']

    def fetch_manga_seed_page(self, url):
        header = {'Cookie': 'vns_Adult=yes'}
        return self.get_html(url, headers=header)

    def fetch_chapter_seed_page(self, url):
        # http://kissmanga.com/Manga/Manga-Name/Chapter-Name?id=XXXXXXX
        # The "Chapter-Name" part can be any non-empty string and the response
        # will be the same. Problem is that it sometimes contains illegal chars
        # that make pytaku's request fail. Let's replace it with something
        # safe.
        base = url[:url.rfind('/') + 1]  # http://.../Manga-Name/
        id = url[url.rfind('?id='):]  # ?id=XXXXXX
        header = {'Cookie': 'vns_readType1=1'}
        return self.get_html(base + '_' + id, headers=header)

    def search_by_author(self, author):
        url = 'http://kissmanga.com/AuthorArtist/' + author.replace(' ', '-')
        resp = urlfetch.fetch(url)

        if resp.status_code != 200:
            return []

        soup = BeautifulSoup(resp.content)
        table = soup.find('table', class_='listing')

        if table is None:  # no author of this name
            return []

        return [{
            'name': a.text.strip(),
            'url': 'http://kissmanga.com' + a['href'],
            'site': 'kissmanga',
        } for a in table.find_all('a') if len(a['href'].split('/')) == 3]
