from unittest import TestCase, main
from pytaku.sites import Kissmanga

k = Kissmanga()


class SearchSeries(TestCase):

    def test_matched(self):
        series_list = k.search_series('Naruto')
        self.assertIsInstance(series_list, list)

        matched = [s for s in series_list if s['name'] == 'Naruto']
        self.assertTrue(len(matched) == 1,
                        "Should find a match for 'Naruto' search")

        found_result = matched[0]
        self.assertIsInstance(found_result, dict)

        expected = {
            'name': 'Naruto',
            'url': 'http://kissmanga.com/Manga/Naruto',
            'site': 'kissmanga',
        }
        for key, val in expected.iteritems():
            self.assertEqual(found_result[key], val)

    def test_gibberish(self):
        series_list = k.search_series('Mot con vit xoe ra hai cai canh')
        self.assertTrue(len(series_list) == 0)


class SeriesInfo(TestCase):

    def test_normal(self):
        url = 'http://kissmanga.com/Manga/One-Piece'
        info = k.series_info(k.fetch_manga_seed_page(url))
        self.assertIsInstance(info, dict)

        # Attributes that can be asserted by exact value:
        expected = {
            'name': 'One Piece',
            'site': 'kissmanga.com',
            'thumb_url': 'http://kissmanga.com/Uploads/Etc/8-24-2011/5569412cover.jpg',
            'tags': ['action', 'adventure', 'comedy', 'drama', 'fantasy',
                     'manga', 'martial arts', 'mystery', 'shounen'],
        }
        for key, val in expected.iteritems():
            self.assertEqual(info[key], val)

        # The rest:

        self.assertIsInstance(info['description'], list)
        for d in info['description']:
            self.assertIsInstance(d, unicode)

        self.assertIsInstance(info['status'], unicode)
        self.assertIn(info['status'], ['ongoing', 'completed'])

        chapters = info['chapters']
        self.assertIsInstance(chapters, list)
        self.assertTrue(len(chapters) > 666)
        for chap in chapters:
            self.assertIsInstance(chap, dict)
            self.assertIn('url', chap)
            self.assertIn('name', chap)

if __name__ == '__main__':
    main()
