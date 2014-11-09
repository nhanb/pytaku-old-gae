# -*- coding: utf-8 -*-
import urllib
from google.appengine.api import urlfetch
import json
from pytaku.sites import Site


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

    # All kinds of data
    # - name "Naruto"
    # - chapters [{name, url}, {}, ...] - latest first
    # - thumb_url "url"
    # - tags [tag1, tag2, ...]
    # - status "ongoing"/"completed"
    # - description ["paragraph1", "paragraph2", ...]
    def series_info(self, html):
        pass

    # Chapter data
    # - name "Naruto Ch.101"
    # - pages [{filename, url}, {}, ...] - in ascending order
    # - prev_chapter_url
    # - next_chapter_url
    # - series_url
    def chapter_info(self, html):
        pass
