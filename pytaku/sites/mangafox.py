import urllib
import re
from google.appengine.api import urlfetch
from pytaku.sites import Site
from bs4 import BeautifulSoup
from pytaku.api.exceptions import PyError  # urgh, ugly!

SERIES_BASE = 'http://mangafox.me/manga/'


class Mangafox(Site):

    netlocs = ['mangafox.me']

    def _search(self, params):
        url = 'http://mangafox.me/search.php?' + urllib.urlencode(params)
        resp = urlfetch.fetch(url)

        if resp.status_code != 200:
            return []

        soup = BeautifulSoup(resp.content)

        # Okay so Mangafox's advanced search is so stupid that if there is no
        # series matching the name it will just return the list of all manga
        # series it has.
        #
        # Detecting this case by checking if the match count is outrageous:
        result_count_regex = re.compile('Total Manga Series: (\d+)')
        t = soup.find('div', text=result_count_regex)
        if t is not None:
            count = int(result_count_regex.match(t.text).groups()[0])
            if count > 15100:
                return []

        table = soup.find('table', id='listing')
        if table is None:  # no author of this name
            return []

        trs = table.find_all('tr')[1:]
        atags = [tr.find('a', class_='series_preview')
                 for tr in trs]

        return [{
            'name': a.text.strip(),
            'url': a.attrs['href'],
            'site': 'mangafox',
        } for a in atags]

    def search_series(self, keyword):
        params = {
            'name_method': 'cw',
            'name': keyword,
            'advopts': '1',
        }
        return self._search(params)

    def _normalize_chapter_href(self, href):
        if not href.endswith('/1.html'):
            if href.endswith('/'):
                href += '1.html'
            else:
                href += '/1.html'
        return href

    def series_info(self, html):
        soup = BeautifulSoup(html)

        # === Chapters

        atags = soup.find('div', id='chapters').find_all('a', class_='tips')

        chapters = [{
            'name': a.parent.text.strip().replace('\n', ' - '),
            'url': self._normalize_chapter_href(a.attrs['href']),
        } for a in atags]

        # === Thumbnail

        thumb_url = soup.find('div', class_='cover').find('img').attrs['src']

        # === Name

        name = soup.find('meta', {'property': 'og:title'}).attrs['content']
        if name.endswith(' Manga'):
            name = name[:-len(' Manga')]

        # === Authors, tags and descriptions

        div = soup.find('div', id='title')

        # This div has a table that has Authors and Tags info in its 2nd row
        tds = div.find('table').find_all('tr')[1].find_all('td')

        # Authors and Artists are in 2nd and 3rd table cells:
        authors = {a.text.strip() for a in tds[1].find_all('a')}
        artists = {a.text.strip() for a in tds[2].find_all('a')}
        authors.update(artists)
        authors = list(authors)

        # Tags are in 4 cell:
        tags = [a.text.strip().lower() for a in tds[3].find_all('a')]

        # Descriptions are in a <p> tag below
        desc_tag = div.find('p', class_='summary')
        desc = [] if desc_tag is None else desc_tag.text.split('\r\n')

        description = [d.strip() for d in desc]

        # === Status
        h5 = soup.find('div', {'id': 'series_info'}).find('h5', text='Status:')
        status = h5.parent.find('span').text.strip().split(',')[0].lower()

        return {
            'chapters': chapters,
            'thumb_url': thumb_url,
            'name': name,
            'tags': tags,
            'status': status,
            'description': description,
            'authors': authors,
            'site': 'mangafox',
        }

    def chapter_info(self, html, **kwargs):
        soup = BeautifulSoup(html)

        # === Chapter name

        name_meta = soup.find('meta', {'property': 'og:description'})
        name = name_meta.attrs['content'].strip()

        # === Series URL

        series_div = soup.find('div', id='series')
        series_url = series_div.find_all('a')[-1].attrs['href']

        # === Prev/Next URLs

        prev, next = None, None

        chnav = soup.find('div', id='chnav')

        prev_a = chnav.find('span', text='Previous Chapter:').parent.find('a')
        if prev_a is not None:
            prev = prev_a.attrs['href']

        next_p = chnav.find('span', text='Next Chapter:').parent
        if not next_p.text.strip().endswith('is coming next...'):
            next_a = next_p.find('a')
            if next_a is not None:
                next = next_a.attrs['href']

        pages = self._pages(soup, html, kwargs['url'])

        return {
            'name': name,
            'pages': pages,
            'series_url': series_url,
            'next_chapter_url': next,
            'prev_chapter_url': prev,
        }

    def _pages(self, soup, html, page1_url):

        base_url = '/'.join(page1_url.split('/')[:-1]) + '/%s.html'

        # a <select> tag has options that each points to a page
        opts = soup.find('select', class_='m').find_all('option')
        urls = [base_url % opt['value'] for opt in opts]

        # Page 1 has already been fetched (stored in this html param, duh!)
        # so let's save ourselves an http request
        pages_htmls = [html]
        urls = urls[1:-1]  # also remove last one since it's a comments page

        rpcs = []
        for url in urls:
            rpc = urlfetch.create_rpc()
            urlfetch.make_fetch_call(rpc, url)
            rpcs.append(rpc)

        # Finish all RPCs
        for rpc in rpcs:
            result = rpc.get_result()
            if result.status_code != 200:
                # TODO: should retry instead of panicking
                raise PyError(result.content)
            pages_htmls.append(result.content)

        returns = []
        for page_html in pages_htmls:
            soup = BeautifulSoup(page_html)
            viewer = soup.find('div', id='viewer')
            # Viewer div now as 2 img tags inside, first one is a "loading"
            # gif, second one is the correct page image.
            img_url = viewer.find_all('img')[-1].attrs['src']
            returns.append(img_url)
        return returns

    def search_by_author(self, keyword):

        # HUGE TODO: this search only covers authors, NOT artists.  To search
        # for artists you'll need to fire off another search request with
        # `artist_method` and `artist` params. However, we can't consecutively
        # send 2 search requests because there is a 5s cooldown after every
        # search. No idea how to work around this yet...
        params = {
            'author_method': 'cw',
            'author': keyword,
            'advopts': '1',
        }
        return self._search(params)
