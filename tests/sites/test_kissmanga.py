from unittest import TestCase, main
from pytaku.sites import Kissmanga

k = Kissmanga()


class SearchSeries(TestCase):

    def test_naruto(self):
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


if __name__ == '__main__':
    main()
