import urllib
import re
from google.appengine.api import urlfetch
from pytaku.sites import Site
from pytaku.api.exceptions import PyError
from bs4 import BeautifulSoup


# Define custom BeautifulSoup filter to get <img> tags that are sure to hold
# manga page image url
def _page_img_tag(tag):
    if tag.name == 'img' and 'src' in tag.attrs:
        _page_url_pat = re.compile('^http://img.bato.to/comics/\d{4}.*$')
        return bool(_page_url_pat.match(tag.attrs['src']))
    return False


class Batoto(Site):

    netloc = 'bato.to'

    def search_titles(self, keyword):
        url = 'http://bato.to/search?'
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

    def chapter_info(self, html):
        soup = BeautifulSoup(html)
        pages = self._chapter_pages(soup, html)
        name = self._chapter_name(soup)
        title_url = self._chapter_title_url(soup)
        prev, next = self._chapter_prev_next(soup)
        return {
            'name': name,
            'pages': pages,
            'title_url': title_url,
            'next_chapter_url': next,
            'prev_chapter_url': prev,
        }

    def _chapter_prev_next(self, soup):
        next = soup.find('img', title='Next Chapter')
        if next is not None:
            next = next.parent['href']
        prev = soup.find('img', title='Previous Chapter')
        if prev is not None:
            prev = prev.parent['href']
        return prev, next

    def _chapter_name(self, soup):
        select = soup.find('select', attrs={'name': 'chapter_select'})
        return select.find('option', selected=True).text.strip()

    def _chapter_title_url(self, soup):
        a_tag = soup.find('div', class_='moderation_bar').find('a')
        return a_tag['href']

    def _chapter_pages(self, soup, html):
        # For webtoons, all pages are shown in a single page.
        # When that's the case, there's this element that asks if you want to
        # view page-by-page instead. Let's use this element to check if we're
        # parsing a webtoon chapter.
        webtoon = soup.find('a', href='?supress_webtoon=t')
        if webtoon is not None:
            img_tags = soup.find_all(_page_img_tag)
            return [{
                'url': tag['src'],
                'filename': tag['src'].split('/')[-1]
            } for tag in img_tags]

        # a <select> tag has options that each points to a page
        opts = soup.find('select', id='page_select').find_all('option')
        urls = [opt['value'] for opt in opts]

        # Page 1 has already been fetched (stored in this html param, duh!)
        # so let's save ourselves an http request
        pages_htmls = [html]
        urls = urls[1:]

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
            img_url = soup.find('img', id='comic_page')['src']
            returns.append(img_url)
        return returns
