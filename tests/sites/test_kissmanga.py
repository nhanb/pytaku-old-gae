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
            'authors': ['Oda Eiichiro'],
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


class ChapterInfo(TestCase):

    def test_normal(self):
        url = 'http://kissmanga.com/Manga/One-Piece/One-Piece-759--Secret-Plan?id=207114'
        info = k.chapter_info(k.fetch_chapter_seed_page(url))
        self.assertIsInstance(info, dict)

        expected = {
            'name': 'One Piece 759: Secret Plan',
            'pages': [
                "http://2.bp.blogspot.com/-qQaCDEu_Cis/VAiQjUyNziI/AAAAAAAAFUs/k98RO-F4lwk/001.png?imgmax=3000",
                "http://2.bp.blogspot.com/-XtV7E9PcGtw/VAiQmYKAbwI/AAAAAAAAFU0/pwA1xG4o6Ok/002.jpg?imgmax=3000",
                "http://2.bp.blogspot.com/-5AEKOxO3Mfg/VAiQnwPeUvI/AAAAAAAAFU8/Qp-yoMA8b-M/003.jpg?imgmax=3000",
                "http://2.bp.blogspot.com/-utK68z0Q_cA/VAiQp6se82I/AAAAAAAAFVE/I5bghj0Jgqs/004.jpg?imgmax=3000",
                "http://2.bp.blogspot.com/-TaSpOAfpgxo/VAiQsTAimJI/AAAAAAAAFVM/EjshVGnr4h0/005.png?imgmax=3000",
                "http://2.bp.blogspot.com/-WfTGXKNsptU/VAiQugzMlsI/AAAAAAAAFVU/U8SoUVfQZv4/006.png?imgmax=3000",
                "http://2.bp.blogspot.com/-xfugxiLxA0I/VAiQxrGWuxI/AAAAAAAAFVc/tYBGLcFhpb4/007.png?imgmax=3000",
                "http://2.bp.blogspot.com/-7qUE3iG8-BE/VAiQ0j72OGI/AAAAAAAAFVk/U7RIR832ZPg/008.png?imgmax=3000",
                "http://2.bp.blogspot.com/-8_iTINiPn8A/VAiQ39fFf7I/AAAAAAAAFVs/D7ym0DXin28/009.png?imgmax=3000",
                "http://2.bp.blogspot.com/-Gk7dR7mrblg/VAiQ7irI7wI/AAAAAAAAFV0/OIRIVtuJtUI/010.png?imgmax=3000",
                "http://2.bp.blogspot.com/-XiKQFO0sE-E/VAiQ92OFk1I/AAAAAAAAFV8/8yLqOK2kH-w/011.png?imgmax=3000",
                "http://2.bp.blogspot.com/-NsDJi_2Eozw/VAiRAVEqMXI/AAAAAAAAFWE/7aBKNWy7L6Q/012.png?imgmax=3000",
                "http://2.bp.blogspot.com/-skZwjwpZy2I/VAiRDhm48HI/AAAAAAAAFWM/skIs4tLpC6c/013.png?imgmax=3000",
                "http://2.bp.blogspot.com/-kCuh6qp4-r8/VAiRGqXV8QI/AAAAAAAAFWU/p8qrq-_F1sY/014.png?imgmax=3000",
                "http://2.bp.blogspot.com/-YUC4r2j1W9E/VAiRJ3CFIsI/AAAAAAAAFWc/6dAOpcP1nGw/015.png?imgmax=3000",
                "http://2.bp.blogspot.com/-fmLP8dvpvE0/VAiRMrqryKI/AAAAAAAAFWk/djkHIMT89YU/016.png?imgmax=3000",
                "http://2.bp.blogspot.com/-h7IUuMq0AVI/VAiRTYatNhI/AAAAAAAAFWs/AU45ZPxlxhs/017.png?imgmax=3000",
                "http://2.bp.blogspot.com/-1nQxcO-vEZA/VAiRYWuFROI/AAAAAAAAFW0/UYqUpcAskm8/018.png?imgmax=3000",
                "http://2.bp.blogspot.com/-JPvll7rrAIE/VAiRaThkK4I/AAAAAAAAFW8/VZhoSP6oM68/019.jpg?imgmax=3000",
                "http://2.bp.blogspot.com/-F0EZX7m4yT8/VAiRdqQ2SdI/AAAAAAAAFXE/VrlpwR0sbWg/020.jpg?imgmax=3000"
            ],
            'series_url': 'http://kissmanga.com/Manga/One-Piece',
            'next_chapter_url': 'http://kissmanga.com/Manga/One-Piece/One-Piece-760--The-Same-Stakes?id=207602',
            'prev_chapter_url': 'http://kissmanga.com/Manga/One-Piece/One-Piece-758--Ignore-it-and-move-on?id=206441',
        }
        for key, val in expected.iteritems():
            self.assertEqual(info[key], val,
                             "Chapter info field '%s' mismatch:\nExpected:\n%s\nFound:\n%s" % (key, val, info[key]))


class SearchByAuthor(TestCase):

    def test_normal(self):
        """
        Vitaku (currently) doesn't have author info at all.
        """

        series_list = k.search_by_author('FUJIKO F. Fujio')
        print '>>> Got list:'
        for s in series_list:
            print s
        self.assertEquals(series_list, [
            {
                'name': 'Chinpui',
                'url': 'http://kissmanga.com/Manga/Chinpui',
                'site': 'kissmanga',
            },
            {
                'name': 'Doraemon',
                'url': 'http://kissmanga.com/Manga/Doraemon',
                'site': 'kissmanga',
            },
            {
                'name': 'The Doraemons',
                'url': 'http://kissmanga.com/Manga/The-Doraemons',
                'site': 'kissmanga',
            },
            {
                'name': 'The Doraemons - Doraemon Game Comic',
                'url': 'http://kissmanga.com/Manga/The-Doraemons-Doraemon-Game-Comic',
                'site': 'kissmanga',
            },
        ])

if __name__ == '__main__':
    main()
