from unittest import TestCase, main
from pytaku.sites.vitaku import Vitaku

site = Vitaku()


class SearchSeries(TestCase):

    def test_matched(self):
        series_list = site.search_series('Naruto')
        self.assertIsInstance(series_list, list)

        print series_list

        matched = [s for s in series_list if s['name'] == 'Naruto']
        self.assertTrue(len(matched) > 0,
                        "Should find at least a match for 'Naruto' search")

        found_result = matched[0]
        self.assertIsInstance(found_result, dict)

        expected = {
            'name': 'Naruto',
            'url': 'http://vitaku.com/doc-naruto-online/',
            'site': 'vitaku',
        }
        for key, val in expected.iteritems():
            self.assertEqual(found_result[key], val)

    def test_gibberish(self):
        series_list = site.search_series('Mot con vit xoe ra hai cai canh')
        self.assertTrue(len(series_list) == 0)


if __name__ == '__main__':
    main()
