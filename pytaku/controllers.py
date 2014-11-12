from pytaku.models import Series, Chapter
from pytaku import sites
from pytaku.api.exceptions import PyError
from datetime import datetime


def create_or_get_series(url, no_update=False):
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
    if series_record and (no_update or series_record.is_fresh()):
        return series_record

    # Fetch series info (name, thumburl, chapter list, etc.)
    series_page = site.fetch_manga_seed_page(url)
    series = site.series_info(series_page)

    # Create new series if not in db yet
    if series_record is None:
        series_record = Series.create(url,
                                      site.netlocs[0],
                                      series['name'],
                                      series['thumb_url'],
                                      series['chapters'],
                                      series['status'],
                                      series['tags'],
                                      series['description'],
                                      series['authors'])
    else:
        # Update existing Series db record
        fields = ('site', 'name', 'thumb_url', 'chapters', 'status', 'tags',
                  'description', 'authors')
        params = {field: series[field] for field in fields}
        update_series(series_record, **params)

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

        if info['series_url']:
            series = create_or_get_series(info['series_url'])
        else:
            series = type('', (object, ), {'name': 'Unknown'})

        chapter = Chapter.create(url,
                                 info['name'],
                                 info['pages'],
                                 info['series_url'],
                                 series.name,
                                 info['prev_chapter_url'],
                                 info['next_chapter_url'])
        chapter.put()

    return chapter


def update_series(series, **kwargs):

    if 'chapters' in kwargs:
        # Update next_chapter_url for the chapter that was previously the
        # latest but not anymore
        new_chapters = kwargs['chapters']
        new_chapters_num = len(new_chapters) - len(series.chapters)
        if new_chapters_num > 0:

            # previously latest chapter that needs updating:
            chapter_url = series.chapters[0]['url']
            chap = Chapter.get_by_url(chapter_url)

            if chap is not None:
                i = new_chapters_num - 1
                chap.next_chapter_url = new_chapters[i]['url']
                chap.put()

        kwargs['chapters'] = new_chapters

    # Update if a field has new value
    changed_keys = []
    for key, val in kwargs.iteritems():
        if getattr(series, key) != val:
            setattr(series, key, val)
            changed_keys.append(key)

    # Update series name in all of its existing chapters
    if 'name' in changed_keys:
        Chapter.set_series_name(series.url, kwargs['name'])

    series.last_update = datetime.now()  # "refresh" this series
    series.put()
