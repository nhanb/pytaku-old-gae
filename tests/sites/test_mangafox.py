from unittest import TestCase, main
from pytaku.sites.mangafox import Mangafox

site = Mangafox()


class SearchSeries(TestCase):

    def test_matched(self):
        series_list = site.search_series('naruto')
        self.assertIsInstance(series_list, list)

        matched = [s for s in series_list if s['name'] == 'Naruto']
        self.assertTrue(len(matched) == 1,
                        "Should find a match for 'Naruto' search")

        found_result = matched[0]
        self.assertIsInstance(found_result, dict)

        expected = {
            'name': 'Naruto',
            'url': 'http://mangafox.me/manga/naruto/',
            'site': 'mangafox',
        }
        for key, val in expected.iteritems():
            self.assertEqual(found_result[key], val)


class SeriesInfo(TestCase):

    def test_normal(self):
        url = 'http://mangafox.me/manga/naruto/'
        info = site.series_info(site.fetch_manga_seed_page(url))
        self.assertIsInstance(info, dict)

        # Attributes that can be asserted by exact value:
        expected = {
            'name': 'Naruto',
            'site': 'mangafox',
            'thumb_url': 'http://l.mfcdn.net/store/manga/8/cover.jpg?1421733918',
            'tags': ['action', 'adventure', 'comedy', 'drama', 'fantasy',
                     'martial arts', 'shounen'],
            'authors': ['Kishimoto Masashi'],
            'description': [u'Twelve years ago, the powerful Nine-Tailed Demon Fox attacked the ninja village of Konohagakure the village hidden in the leaves.',
                            u'The demon was defeated and sealed into the infant Naruto Uzumaki, by the Fourth Hokage who sacrificed his life to protect the village.',
                            u"Now, Naruto is the number one most Unpredictable knuckleheaded ninja who's determined to become the next Hokage and be acknowledged by everyone who ever doubted him! From cool fights showing what it really means to be a ninja to fights for things they believe in to hairbrained fun and jokes naruto's adventures have got it all!",
                            u'With the will to never give up and a great left hook along with his ninja way: to never go back on his word, will Naruto the former outcast achieve his dream?'],
            'status': 'completed',
        }
        for key, val in expected.iteritems():
            self.assertEqual(info[key], val)

        # The rest:
        chapters = info['chapters']
        self.assertIsInstance(chapters, list)
        self.assertTrue(len(chapters) > 666)
        for chap in chapters:
            self.assertIsInstance(chap, dict)
            self.assertIn('url', chap)
            self.assertIn('name', chap)

    def test_5cm(self):
        """
        This series's page list is special: some have their title and url
        inside an h4, while some are inside an h3
        => Don't rely on the h tags when parsing this site!
        """

        url = 'http://mangafox.me/manga/byousoku_5_centimeter/'
        info = site.series_info(site.fetch_manga_seed_page(url))
        self.assertIsInstance(info, dict)

        expected = {
            'name': 'Byousoku 5 Centimeter',
            'site': 'mangafox',
            'thumb_url': 'http://l.mfcdn.net/store/manga/9040/cover.jpg?1371693375',
            'tags': ['drama', 'romance', 'school life', 'seinen'],
            'authors': ['Shinkai Makoto', 'Seike Yukiko'],
            'status': 'completed',
            'description': [
                "A tale of two people, Tono Takaki and Shinohara Akari, who were close friends but gradually grow farther and farther apart as time moves on. They become separated because of their families yet continue to exchange contact in the form of letters. Yet as time continues to trudge on, their contact with one another begins to cease. Years pass and the rift between them grows ever larger. However, Takaki remembers the times they have shared together, but as life continues to unfold for him, he wonders if he would be given the chance to meet Akari again as the tale embarks on Takaki's realization of the world and people around him.",
                "Source: ANN",
            ],

            'chapters': [
                {
                    "url": "http://mangafox.me/manga/byousoku_5_centimeter/v02/c011/1.html",
                    "name": "Byousoku 5 Centimeter 11 - The Poem of the Sky and Sea",
                },
                {
                    "url": "http://mangafox.me/manga/byousoku_5_centimeter/v02/c010/1.html",
                    "name": "Byousoku 5 Centimeter 10 - One More Time, One More Chance",
                },
                {
                    "url": "http://mangafox.me/manga/byousoku_5_centimeter/v02/c009/1.html",
                    "name": "Byousoku 5 Centimeter 9 - End Theme_3",
                },
                {
                    "url": "http://mangafox.me/manga/byousoku_5_centimeter/v02/c008/1.html",
                    "name": "Byousoku 5 Centimeter 8 - End Theme_2",
                },
                {
                    "url": "http://mangafox.me/manga/byousoku_5_centimeter/v02/c007/1.html",
                    "name": "Byousoku 5 Centimeter 7 - End Theme 1",
                },
                {
                    "url": "http://mangafox.me/manga/byousoku_5_centimeter/v02/c006/1.html",
                    "name": "Byousoku 5 Centimeter 6 - To Become Your Number One...",
                },
                {
                    "url": "http://mangafox.me/manga/byousoku_5_centimeter/v01/c005/1.html",
                    "name": "Byousoku 5 Centimeter 5 - Cosmonaut",
                },
                {
                    "url": "http://mangafox.me/manga/byousoku_5_centimeter/v01/c004/1.html",
                    "name": "Byousoku 5 Centimeter 4 - Kanae's Feelings",
                },
                {
                    "url": "http://mangafox.me/manga/byousoku_5_centimeter/v01/c003/1.html",
                    "name": "Byousoku 5 Centimeter 3 - Distant Memories",
                },
                {
                    "url": "http://mangafox.me/manga/byousoku_5_centimeter/v01/c002/1.html",
                    "name": "Byousoku 5 Centimeter 2 - Uneasiness",
                },
                {
                    "url": "http://mangafox.me/manga/byousoku_5_centimeter/v01/c001/1.html",
                    "name": "Byousoku 5 Centimeter 1 - Sakura",
                },
            ]
        }

        for key, val in expected.iteritems():
            self.assertEqual(info[key], val)

    def test_no_desc(self):
        """
        Some series don't have descriptions
        """

        # Just for the record, I don't read this. Some user did and brought
        # this bug to my attention...
        url = 'http://mangafox.me/manga/joou_sama_no_eshi'
        info = site.series_info(site.fetch_manga_seed_page(url))
        self.assertIsInstance(info, dict)

        # Attributes that can be asserted by exact value:
        expected = {
            'name': 'Joou sama no Eshi',
            'site': 'mangafox',
            'thumb_url': 'http://a.mfcdn.net/store/manga/14292/cover.jpg?1430729735',
            'tags': ['ecchi', 'school life', 'seinen'],
            'authors': ['Watashiya Kaworu'],
            'description': [],
        }
        for key, val in expected.iteritems():
            self.assertEqual(info[key], val)

class ChapterInfo(TestCase):

    def test_normal(self):
        url = 'http://mangafox.me/manga/byousoku_5_centimeter/v02/c010/1.html'
        info = site.chapter_info(site.fetch_chapter_seed_page(url), url=url)
        self.assertIsInstance(info, dict)

        expected = {
            'name': 'Byousoku 5 Centimeter 10: One More Time, One More Chance',
            'pages': [
                "http://z.mfcdn.net/store/manga/9040/02-010.0/compressed/smangacode_byousoku_5_centimeter_10.b52_000.jpg",
                "http://z.mfcdn.net/store/manga/9040/02-010.0/compressed/smangacode_byousoku_5_centimeter_10.b52_149.jpg",
                "http://z.mfcdn.net/store/manga/9040/02-010.0/compressed/smangacode_byousoku_5_centimeter_10.b52_150.jpg",
                "http://z.mfcdn.net/store/manga/9040/02-010.0/compressed/smangacode_byousoku_5_centimeter_10.b52_151.jpg",
                "http://z.mfcdn.net/store/manga/9040/02-010.0/compressed/smangacode_byousoku_5_centimeter_10.b52_152.jpg",
                "http://z.mfcdn.net/store/manga/9040/02-010.0/compressed/smangacode_byousoku_5_centimeter_10.b52_153.jpg",
                "http://z.mfcdn.net/store/manga/9040/02-010.0/compressed/smangacode_byousoku_5_centimeter_10.b52_154.jpg",
                "http://z.mfcdn.net/store/manga/9040/02-010.0/compressed/smangacode_byousoku_5_centimeter_10.b52_155.jpg",
                "http://z.mfcdn.net/store/manga/9040/02-010.0/compressed/smangacode_byousoku_5_centimeter_10.b52_156.jpg",
                "http://z.mfcdn.net/store/manga/9040/02-010.0/compressed/smangacode_byousoku_5_centimeter_10.b52_157.jpg",
                "http://z.mfcdn.net/store/manga/9040/02-010.0/compressed/smangacode_byousoku_5_centimeter_10.b52_158.jpg",
                "http://z.mfcdn.net/store/manga/9040/02-010.0/compressed/smangacode_byousoku_5_centimeter_10.b52_159.jpg",
                "http://z.mfcdn.net/store/manga/9040/02-010.0/compressed/smangacode_byousoku_5_centimeter_10.b52_160.jpg",
                "http://z.mfcdn.net/store/manga/9040/02-010.0/compressed/smangacode_byousoku_5_centimeter_10.b52_161.jpg",
                "http://z.mfcdn.net/store/manga/9040/02-010.0/compressed/smangacode_byousoku_5_centimeter_10.b52_162.jpg",
                "http://z.mfcdn.net/store/manga/9040/02-010.0/compressed/smangacode_byousoku_5_centimeter_10.b52_163.jpg",
                "http://z.mfcdn.net/store/manga/9040/02-010.0/compressed/smangacode_byousoku_5_centimeter_10.b52_164.jpg",
                "http://z.mfcdn.net/store/manga/9040/02-010.0/compressed/smangacode_byousoku_5_centimeter_10.b52_165.jpg",
                "http://z.mfcdn.net/store/manga/9040/02-010.0/compressed/smangacode_byousoku_5_centimeter_10.b52_166.jpg",
                "http://z.mfcdn.net/store/manga/9040/02-010.0/compressed/smangacode_byousoku_5_centimeter_10.b52_167.jpg",
                "http://z.mfcdn.net/store/manga/9040/02-010.0/compressed/smangacode_byousoku_5_centimeter_10.b52_168.jpg",
                "http://z.mfcdn.net/store/manga/9040/02-010.0/compressed/smangacode_byousoku_5_centimeter_10.b52_169.jpg",
                "http://z.mfcdn.net/store/manga/9040/02-010.0/compressed/smangacode_byousoku_5_centimeter_10.b52_170.jpg",
                "http://z.mfcdn.net/store/manga/9040/02-010.0/compressed/smangacode_byousoku_5_centimeter_10.b52_171.jpg",
                "http://z.mfcdn.net/store/manga/9040/02-010.0/compressed/smangacode_byousoku_5_centimeter_10.b52_172.jpg",
                "http://z.mfcdn.net/store/manga/9040/02-010.0/compressed/smangacode_byousoku_5_centimeter_10.b52_173.jpg",
                "http://z.mfcdn.net/store/manga/9040/02-010.0/compressed/smangacode_byousoku_5_centimeter_10.b52_174.jpg",
                "http://z.mfcdn.net/store/manga/9040/02-010.0/compressed/smangacode_byousoku_5_centimeter_10.b52_175.jpg",
                "http://z.mfcdn.net/store/manga/9040/02-010.0/compressed/smangacode_byousoku_5_centimeter_10.b52_176.jpg",
                "http://z.mfcdn.net/store/manga/9040/02-010.0/compressed/smangacode_byousoku_5_centimeter_10.b52_177.jpg",
                "http://z.mfcdn.net/store/manga/9040/02-010.0/compressed/smangacode_byousoku_5_centimeter_10.b52_178.jpg",
            ],
            'series_url': 'http://mangafox.me/manga/byousoku_5_centimeter/',
            'next_chapter_url': 'http://mangafox.me/manga/byousoku_5_centimeter/v02/c011/1.html',
            'prev_chapter_url': 'http://mangafox.me/manga/byousoku_5_centimeter/v02/c009/1.html',
        }
        for key, val in expected.iteritems():
            self.assertEqual(info[key], val,
                             "Chapter info field '%s' mismatch:\nExpected:\n%s\nFound:\n%s" % (key, val, info[key]))


class SearchByAuthor(TestCase):

    def test_normal(self):
        series_list = site.search_by_author('FUJIKO F. Fujio')
        print '>>> Got list:'
        for s in series_list:
            print s
        self.assertEquals(series_list, [
            {
                'name': 'Doraemon',
                'url': 'http://mangafox.me/manga/doraemon/',
                'site': 'mangafox',
            },
            {
                'name': 'Doraemon Long Stories',
                'url': 'http://mangafox.me/manga/doraemon_long_stories/',
                'site': 'mangafox',
            },
            {
                'name': "The Doraemon's Special",
                'url': 'http://mangafox.me/manga/the_doraemon_s_special/',
                'site': 'mangafox',
            },
            {
                'name': 'The Doraemons - Doraemon Game Comic',
                'url': 'http://mangafox.me/manga/the_doraemons_doraemon_game_comic/',
                'site': 'mangafox',
            },
        ])


if __name__ == '__main__':
    main()
