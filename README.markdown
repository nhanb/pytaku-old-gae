# Pytaku

... is the last online manga reader you'll ever need!

Join the chat room for latest development updates and official support:  
[![Gitter chat](https://badges.gitter.im/nhanb/pytaku.png)](https://gitter.im/nhanb/pytaku)

# How to use

- Go to https://pytaku.appspot.com
- Click **Search**
- ... it's pretty straightforward, really!

Pytaku currently gets data from [batoto][1] and [kissmanga][2]. Manga info is saved to Pytaku's own
database after first view, so naturally popular manga titles will be blazing fast because somebody
else has probably triggered the first view before you :)

The latest development version is deployed at https://pytaku-dev.appspot.com. Note that I might
regularly break stuff there so don't use it if you want stability.

# How to develop

[Download][3] and [get familiar with][4] Google App Engine Python SDK if you haven't already.

## Frontend

To build client side assets, you'll need `gulp`. If you're not familiar with nodejs, I suggest
[installing it with `nvm`][5]. When you have done that, clone this repo, `cd` into it and run:

```bash
$ npm install -g gulp
$ npm install
$ gulp
# If you want to minify css/js, use `gulp deploy` instead of `gulp`
```

All the frontend code is in `frontend/` directory, except for `Gulpfile.js` and `bower.json`. Built
assets will go to `frontend-dist/`.

You can also use `gulp watch` to watch for frontend code changes and trigger livereload. Check out
`Gulpfile.js` for more.

## Backend

I strongly recommend using `virtualenv` + `virtualenvwrapper`. If you're not already using them,
Google is your friend. Once you've made and activated a virtualenv for pytaku, it's optional but
recommended to install the packages in `requirements.txt`:

```bash
$ pip install -r requirements.txt
```
Then use Google App Engine SDK to serve it normally at [http://localhost:8080][6]. Easy, no?

**Note:** I have a weird thing for PEP-8 compatible code. If you use vim, install Syntastic and use
`flake8` as the python checker. I won't accept code that causes any error/warning in Syntastic.

## Run your own site

- Follow frontend setup instructions to build frontend assets
- Register a new app from https://appengine.google.com/
- Change the first line of `app.yaml` into `application: your_app_name` (must match the name you
  just registered)
- Use [Google App Engine Python SDK][3] to deploy
- Your app should now be live at [https://your_app_name.appspot.com](#)

# Credit where it's due

The backend code uses [BeautifulSoup][7] and [passlib][8] libraries, whose licenses are included in
their respective directories in `lib/`.

Frontend code uses [React][9] for views and [director][10] for routing. A bunch of other libraries
are also used, which you can find in `bower.json`.

# License

GPLv3, obviously! (see `LICENSE.txt`)

[1]: http://www.batoto.net/
[2]: http://kissmanga.com/
[3]: https://developers.google.com/appengine/downloads
[4]: https://developers.google.com/appengine/docs/python/gettingstartedpython27/introduction
[5]: https://github.com/creationix/nvm
[6]: http://localhost:8080
[7]: http://www.crummy.com/software/BeautifulSoup/
[8]: https://pythonhosted.org/passlib/
[9]: http://facebook.github.io/react/
[10]: https://github.com/flatiron/director
