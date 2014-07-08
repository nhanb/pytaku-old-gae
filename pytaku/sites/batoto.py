import urllib
from google.appengine.api import urlfetch
from pytaku.sites import Site
from bs4 import BeautifulSoup


class Batoto(Site):

    netloc = 'www.batoto.net'

    def search_titles(self, keyword):
        url = 'http://www.batoto.net/search?'
        params = {
            'name_cond': 'c',  # "name contains keyword"
            'name': keyword
        }

        url += urllib.urlencode(params)
        resp = urlfetch.fetch(url, method='GET')

        if resp.status_code != 200:
            return []  # TODO maybe show some meaningful error alert to user?

        soup = BeautifulSoup(resp.content)
        table = soup.find('table', class_='chapters_list')
        strongs = table.find_all('strong')
        titles = []
        for strong in strongs:
            a = strong.find('a')
            url = a['href']
            name = a.contents[1].strip()
            titles.append({
                'url': url,
                'name': name,
                'site': 'batoto',
            })
        return titles

    def title_info(self, html):
        soup = BeautifulSoup(html)
        chapters = self._chapters(soup)
        thumbnailUrl, tags = self._thumbnail_url_and_tags(soup)
        name = self._name(soup)
        return {'chapters': chapters,
                'thumbnailUrl': thumbnailUrl,
                'name': name,
                'tags': tags}

    def _name(self, soup):
        return soup.find('h1', class_='ipsType_pagetitle').contents[0].strip()

    def _chapters(self, soup):
        try:
            table = soup.find('table', class_='chapters_list')
            en_rows = table.find_all('tr', class_='lang_English')

            chapters = []
            for row in en_rows:
                a = row.find('a')
                url = a['href']
                name = a.contents[1].strip()
                chapters.append({
                    'name': name,
                    'url': url
                })
            return chapters

        except AttributeError:
            return []

    def _thumbnail_url_and_tags(self, soup):
        try:
            box = soup.find('div', class_='ipsBox')
            thumb = box.find('img')['src']

            # This cell stores <a> that store tags
            tags_cell = box.find('td', text='Genres:').find_next_sibling('td')
            tags = [a.find('span').contents[1].lower() for a in tags_cell]

            return (thumb, tags)
        except:
            return ([], [])

    def chapter_pages(self, html):
        soup = BeautifulSoup(html)

        # a <select> tag has options that each points to a page
        opts = soup.find('select', id='page_select').find_all('option')
        urls = [opt['value'] for opt in opts]

        # Page 1 has already been fetched (stored in this html param, duh!)
        # so let's save ourselves an http request
        pages_htmls = [html]
        urls = urls[1:]

        # TODO: async download while respecting server
        for url in urls:
            pages_htmls.append(self.get_html(url))

        returns = []
        for page_html in pages_htmls:
            soup = BeautifulSoup(page_html)
            img_url = soup.find('img', id='comic_page')['src']
            filename = img_url.split('/')[-1]
            returns.append({
                'filename': filename,
                'url': img_url
            })
        return returns
