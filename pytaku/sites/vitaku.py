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
        return bool(_page_url_pat.match(tag.attrs['href']))
    return False


class Vitaku(Site):

    netloc = 'vitaku.com'

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
        chapters = [{'url': a['href'], 'name': a.text} for a in chapter_hrefs]

        return {
            'name': name,
            'chapters': chapters,
            'tags': [],
            'status': 'n/a',
            'description': description,
            'thumb_url': thumb_url,
            'site': 'vitaku',
        }

    # Chapter data
    # - name "Naruto Ch.101"
    # - pages [{filename, url}, {}, ...] - in ascending order
    # - prev_chapter_url
    # - next_chapter_url
    # - series_url
    def chapter_info(self, html):
        pass
