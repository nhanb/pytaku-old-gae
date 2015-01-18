# -*- coding: utf-8 -*-
import urllib
import re
from google.appengine.api import urlfetch
import json
from pytaku.sites import Site
from bs4 import BeautifulSoup


# Define custom BeautifulSoup filter to get <a> tags that link to chapters
def _chapter_href(tag):
    if tag.name == 'a' and 'href' in tag.attrs:
        _page_url_pat = re.compile(
            '^http://doctruyen.vitaku.com/doc-truyen/.*-chapter-\d+.htm/$'
        )
        return (bool(_page_url_pat.match(tag.attrs['href']))
                and tag.text.strip() != '')
    return False


class Vitaku(Site):

    netlocs = ['vitaku.com', 'doctruyen.vitaku.com']

    def search_series(self, keyword):
        url = 'http://vitaku.com/wp-admin/admin-ajax.php'
        params = {
            's': keyword,
            'action': 'dwls_search',
        }
        resp = urlfetch.fetch(url + '?' + urllib.urlencode(params))
        if resp.status_code != 200:
            return []

        results = json.loads(resp.content)['results']
        returns = []
        _read = u'Đọc '

        for r in results:
            title = r['post_title']  # "Đọc Naruto - Nhẫn giả blah blah blah"
            if not title.startswith(_read) or title.find(' - ') == -1:
                continue
            name = title.split(' - ')[0][len(_read):]
            returns.append({
                'name': name,
                'url': r['permalink'],
                'site': 'vitaku',
            })

        return returns

    def series_info(self, html):
        soup = BeautifulSoup(html)

        name = soup.find('title').text.split(' - ')[0]
        thumb_url = soup.find_all('img', itemprop='image')[-1]['src']

        desc_h4 = soup.find('h4', text='Review Summary:')
        description = [desc_h4.parent.nextSibling.text]

        chapter_hrefs = soup.find_all(_chapter_href)

        def strip_slash(href):
            return href if not href.endswith('/') else href[:-1]

        chapters = [{
            'url': strip_slash(a['href']),
            'name': a.text.strip(),
        } for a in chapter_hrefs]

        return {
            'name': name,
            'chapters': chapters,
            'tags': [],
            'status': 'n/a',
            'description': description,
            'thumb_url': thumb_url,
            'site': 'vitaku',
            'authors': [],  # douchebag site doesn't even mention authors
        }

    def _prev_next_url(self, url):
        if url is None:
            return None

        if url.get('href', None) is None:
            return None

        url = url['href']
        base = 'http://' + self.netlocs[1] + '/doc-truyen'
        if url.startswith('../'):
            url = url.replace('..', base, 1)
        elif not url.startswith('http://'):
            if url.startswith('/'):
                url = base + url
            else:
                url = base + '/' + url

        return url

    # Chapter data
    # - name "Naruto Ch.101"
    # - pages [{filename, url}, {}, ...] - in ascending order
    # - prev_chapter_url
    # - next_chapter_url
    # - series_url
    def chapter_info(self, html):
        soup = BeautifulSoup(html)

        # One Piece - Đọc truyện tranh One Piece chapter 664 - Vitaku
        name = soup.find('title').text.split(' - ')[1].strip()
        if name.startswith(u'Đọc truyện tranh '):
            name = name[17:]

        page = soup.find('div', class_='page')
        page_imgs = page.findChildren('img', recursive=False)
        pages = [img['src'] for img in page_imgs]

        prev = soup.find('a', id='MainContent_hplBack')
        prev = self._prev_next_url(prev)

        next = soup.find('a', id='MainContent_hplNext')
        next = self._prev_next_url(next)

        series_url = soup.find('a', id='hplHomeLink')['href']

        return {
            'name': name,
            'pages': pages,
            'prev_chapter_url': prev,
            'next_chapter_url': next,
            'series_url': series_url,
        }
