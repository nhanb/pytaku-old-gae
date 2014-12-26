# -*- coding: utf-8 -*-

__author__ = 'nampnq'
import re
from google.appengine.api import urlfetch

from pytaku.sites import Site
from bs4 import BeautifulSoup
from datetime import datetime
from unidecode import unidecode
import logging


# Define custom BeautifulSoup filter to get <a> tags that link to chapters
def _chapter_href(tag):
    if tag.name == 'a' and 'href' in tag.attrs:
        _page_url_pat = re.compile(
            '^http://doctruyen.vechai.info/.*-chap-\d+/$'
        )
        return (bool(_page_url_pat.match(tag.attrs['href']))
                and tag.text.strip() != '')
    return False


class Vechai(Site):

    netlocs = ['doctruyen.vechai.info', 'vechai.info']

    def search_series(self, keyword):
        d = datetime.now()
        url = 'http://vechai.info/search/items.js?v=%s-%s-%s' % (d.day, d.month + 1, d.hour)
        urlfetch.set_default_fetch_deadline(60)
        resp = urlfetch.fetch(url)
        if resp.status_code != 200:
            return []

        results = eval(resp.content.replace('var items = ', '').replace(';', ''))
        returns = []

        for r in results:
            try:
                title = unicode(r[0].decode('utf8'))
            except:
                continue
            r[0] = unidecode(title)
            if keyword.lower() in r[0].lower():
                returns.append({
                    'name': r[0],
                    'url': r[1],
                    'site': 'vechai',
                })
        return returns

    def series_info(self, html):
        soup = BeautifulSoup(html)

        name = soup.find('title').text.split(' - ')[0]
        thumb_url = soup.find_all('img', class_='insertimage')[0]['src']

        description = ["", ]

        chapter_hrefs = soup.find('div', class_='baitonghop').find_all(_chapter_href)
        chapters = [{'url': a['href'], 'name': a.text.strip()}
                    for a in chapter_hrefs]

        return {
            'name': name,
            'chapters': chapters,
            'tags': [],
            'status': 'n/a',
            'description': description,
            'thumb_url': thumb_url,
            'site': 'vitaku',
            'authors': [],
        }

    def chapter_info(self, html):
        soup = BeautifulSoup(html)

        # One Piece - Đọc truyện tranh One Piece chapter 664 - Vitaku
        name = soup.find('title').text.split(' | ')[0].strip()
        if name.startswith(u'Đọc truyện'):
            name = name[len(u'Đọc truyện'):]

        page = soup.find('div', class_='entry2').find('p')
        page_imgs = page.find_all('img')
        pages = [img['src'] for img in page_imgs]

        # find prev_page or next_page by decrease or increase chapter number
        chap_url = soup.find('link', rel='canonical')['href']
        chap_info = chap_url.split('/')[-2]
        # Structure chap (.*)-chap-(\d+)
        chap_name, chap_num = re.match('(.*)-chap-(\d+)', chap_info).groups()

        return {
            'name': name,
            'pages': pages,
            'prev_chapter_url': 'http://doctruyen.vechai.info/%s-chap-%s/' % (chap_name,
                                                                              0 if int(chap_num) < 2 else int(chap_num)-1),
            'next_chapter_url': 'http://doctruyen.vechai.info/%s-chap-%s/' % (chap_name, int(chap_num)+1),
            'series_url': 'http://vechai.info/%s' % chap_name,
        }
