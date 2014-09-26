from pytaku.models import Series, Chapter
from pytaku import sites
from pytaku.api.exceptions import PyError


def create_or_get_series(url):
    """
    Fetch info and create Series record if not already created.
    Returns Series object.
    """

    # Check if this url is supported
    site = sites.get_site(url)
    if site is None:
        raise PyError({'msg': 'unsupported_url'})

    # Check if series is already in db
    series_record = Series.get_by_url(url)

    # Skip reloading series info if updated recently
    if series_record and series_record.is_fresh():
        return series_record

    # =============== Create/Update series record ====================

    # Fetch basic series info (name, thumburl, chapter list)
    series_page = site.fetch_manga_seed_page(url)
    series = site.series_info(series_page)

    # Create new series if not in db yet
    if series_record is None:
        series_record = Series.create(url,
                                      site.netloc,
                                      series['name'],
                                      series['thumbnailUrl'],
                                      series['chapters'],
                                      series['status'],
                                      series['tags'],
                                      series['description'])
    else:
        series_record.update(site.netloc,
                             series['name'],
                             series['thumbnailUrl'],
                             series['chapters'],
                             series['status'],
                             series['tags'],
                             series['description'])

    return series_record


def create_or_get_chapter(url):
    """
    Fetch info and create Chapter record if not already created.
    Returns Chapter object.
    """

    # Check if this url is supported
    site = sites.get_site(url)
    if site is None:
        raise PyError({'msg': 'unsupported_url'})

    chapter = Chapter.get_by_url(url)
    if chapter is None:
        page_html = site.fetch_chapter_seed_page(url)
        info = site.chapter_info(page_html)
        chapter = Chapter.create(url, info['name'], info['pages'],
                                 info['series_url'],
                                 info['prev_chapter_url'],
                                 info['next_chapter_url'])
        chapter.put()

    return chapter
