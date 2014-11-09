# -*- coding: utf-8 -*-
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


class SeriesInfo(TestCase):

    def test_normal(self):
        url = 'http://vitaku.com/doc-one-piece-online/'
        info = site.series_info(site.fetch_manga_seed_page(url))
        self.assertIsInstance(info, dict)

        # Attributes that can be asserted by exact value:
        expected = {
            'name': 'One Piece',
            'site': 'vitaku',
            'thumb_url': 'http://vitaku.com/wp-content/uploads/2013/11/one-piece-1.jpg',
            'tags': [],
            'description': [u'One Piece là một câu chuyện phiêu lưu vui nhộn, với dàn nhân vật vẫn tiếp tục phát triển, với những pha hành động và kịch tính giữa nhân vật tuyệt vời. Nét vẽ của Oda là sáng tạo và giàu trí tưởng tượng cứ như tràn ra tất cả các khung truyện. Việc xử lý khung tranh của Oda chứa rất nhiều những góc nhìn và phương hướng thú vị, nhất là ở những đoạn hành động cháy nổ, lúc nào cũng rất kinh ngạc.'],
            'status': 'n/a',
        }
        for key, val in expected.iteritems():
            print '>>> Asserting', key
            print '>>>>>> Found:', info[key]
            print '>>>>>> Expected:', val
            self.assertEqual(info[key], val)

        # The rest:
        chapters = info['chapters']
        self.assertIsInstance(chapters, list)
        self.assertTrue(len(chapters) > 750)
        for chap in chapters:
            self.assertIsInstance(chap, dict)
            self.assertIn('url', chap)
            self.assertIn('name', chap)


if __name__ == '__main__':
    main()
