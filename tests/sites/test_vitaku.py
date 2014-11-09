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


class ChapterInfo(TestCase):

    def test_normal(self):
        url = 'http://doctruyen.vitaku.com/doc-truyen/one-piece-chapter-664.htm/'
        info = site.chapter_info(site.fetch_chapter_seed_page(url))
        self.assertIsInstance(info, dict)

        expected = {
            'name': 'One Piece chapter 664',
            'pages': [
                'http://2.bp.blogspot.com/-SZQMoSXd_P0/T5TDNo7tacI/AAAAAAAAEQ8/kmjL6PL6P8Y/s0/1.jpg%3fimgmax%3d1600',
                'http://2.bp.blogspot.com/-3uTmgromws8/T5TDP2LMZaI/AAAAAAAAERE/qkbiAJFlDUU/s0/1.jpg%3fimgmax%3d1600',
                'http://1.bp.blogspot.com/-MK7WRcipUXo/T5TDRDdyHyI/AAAAAAAAERI/PfXJPpAmKW0/s0/1.jpg%3fimgmax%3d1600',
                'http://1.bp.blogspot.com/-hqe158B7w5U/T5TDRyd37SI/AAAAAAAAERU/z1USOSUc5LI/s0/1.jpg%3fimgmax%3d1600',
                'http://3.bp.blogspot.com/-K4qN9UeW6ig/T5TDS7xZ_hI/AAAAAAAAERY/ZXJ0O543zpA/s0/1.jpg%3fimgmax%3d1600',
                'http://4.bp.blogspot.com/-StdMur9LYRA/T5TDT28WlqI/AAAAAAAAERk/ZfDblE3zg3Y/s0/1.jpg%3fimgmax%3d1600',
                'http://1.bp.blogspot.com/-FgGlPhgpWfE/T5TDUnTIW3I/AAAAAAAAERo/2bbSacjTpJE/s0/1.jpg%3fimgmax%3d1600',
                'http://3.bp.blogspot.com/-3UAsVix5_S8/T5TDVvc6S-I/AAAAAAAAER0/7-Tp7yePNqI/s0/1.jpg%3fimgmax%3d1600',
                'http://3.bp.blogspot.com/-jmCnKJaW00g/T5TDWgliVRI/AAAAAAAAER8/BJvn7LrpawY/s0/1.jpg%3fimgmax%3d1600',
                'http://3.bp.blogspot.com/-YPJhI19ZAhI/T5TDXZbf_uI/AAAAAAAAESA/HZn_1G8ZF0M/s0/1.jpg%3fimgmax%3d1600',
                'http://3.bp.blogspot.com/-6xPUD5SqzR4/T5TDYeBveLI/AAAAAAAAESM/gcGgvDxGznQ/s0/1.jpg%3fimgmax%3d1600',
                'http://1.bp.blogspot.com/-Ti1iQuGYaBY/T5TDZmrsOiI/AAAAAAAAESU/GwbJAtiGhgk/s0/1.jpg%3fimgmax%3d1600',
                'http://1.bp.blogspot.com/-H7dU2X5QTy4/T5TDajGUMXI/AAAAAAAAESc/Uw-vyecZm1c/s0/1.jpg%3fimgmax%3d1600',
                'http://4.bp.blogspot.com/-diaal7e2FMU/T5TDbv6Ly6I/AAAAAAAAESk/Dcx5bKtQhOo/s0/1.jpg%3fimgmax%3d1600',
                'http://3.bp.blogspot.com/-KpBJkK-35GU/T5TDchwqN0I/AAAAAAAAESo/A1WaG2wIOOw/s0/1.jpg%3fimgmax%3d1600',
                'http://1.bp.blogspot.com/-9xNB8LCAXPk/T5TDdvv8TgI/AAAAAAAAESw/Zy2FebR0Wl4/s0/1.jpg%3fimgmax%3d1600',
                'http://1.bp.blogspot.com/-sRcu2mB9A5g/T5TDeQ2R1iI/AAAAAAAAES8/xFNPbKCR-CI/s0/1.jpg%3fimgmax%3d1600',
                'http://4.bp.blogspot.com/-nELWph0DxfE/T5TDfZdMvAI/AAAAAAAAETE/TWYEFtXgvOw/s0/1.jpg%3fimgmax%3d1600',
                'http://1.bp.blogspot.com/-FqAqnv9OXqs/T5TDgXHJ6MI/AAAAAAAAETI/VdTBTY4cx08/s0/1.jpg%3fimgmax%3d1600',
                'http://2.bp.blogspot.com/-xtryRwJdfp8/T5TDhAqj2JI/AAAAAAAAETQ/lUa8Z7IzcpA/s0/1.jpg%3fimgmax%3d1600',
            ],
            'series_url': 'http://vitaku.com/doc-one-piece-online/',
            'next_chapter_url': 'http://doctruyen.vitaku.com/doc-truyen/one-piece-chapter-665.htm',
            'prev_chapter_url': 'http://doctruyen.vitaku.com/doc-truyen/one-piece-chapter-663.htm',
        }
        for key, val in expected.iteritems():
            self.assertEqual(info[key], val,
                             u"Chapter info field '%s' mismatch:\nExpected:\n%s\nFound:\n%s" % (key, val, info[key]))

    def test_special_next_prev_url(self):
        """
        In this case, the next/prev chapter urls don't start with "../" as
        usual. They're simply like "death-note-chapter-25.htm"
        """
        url = 'http://doctruyen.vitaku.com/doc-truyen/death-note-chapter-24.htm'
        info = site.chapter_info(site.fetch_chapter_seed_page(url))
        self.assertIsInstance(info, dict)

        self.assertEqual(info['next_chapter_url'], 'http://doctruyen.vitaku.com/doc-truyen/death-note-chapter-25.htm')
        self.assertEqual(info['prev_chapter_url'], 'http://doctruyen.vitaku.com/doc-truyen/death-note-chapter-23.htm')


if __name__ == '__main__':
    main()
