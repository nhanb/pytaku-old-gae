from unittest import TestCase, main
from pytaku.sites import get_site, Kissmanga, Batoto


class GetSite(TestCase):

    def _test_none(self, *args):
        for url in args:
            self.assertIsNone(get_site(url))

    def _test_instance(self, urls, cls):
        for url in urls:
            self.assertIsInstance(get_site(url), cls)

    def test_unsupported_site(self):
        self._test_none(
            'http://nose.readthedocs.org/en/latest/finding_tests.html',
            'https://news.ycombinator.com/',
        )

    def test_malformed_url(self):
        self._test_none(
            '//nose.readthedocs.org/en/latest/finding_tests.html',
            'Konna toko ni iru hazu mo nai no ni',
            '',
            'http://',
        )

    def test_kissmanga(self):
        urls = (
            'http://kissmanga.com/Manga/Naruto/______?id=209765',
            'http://kissmanga.com/Manga/Naruto',
        )
        self._test_instance(urls, Kissmanga)

    def test_batoto(self):
        urls = (
            'http://bato.to/comic/_/comics/pok%c3%a9mon-special-r3804',
            'http://bato.to/read/_/276966/senyuu_v3_ch12_by_hero45',
        )
        self._test_instance(urls, Batoto)


if __name__ == '__main__':
    main()
