# WARNING: It's still under heavy development

Which basically means I'm still trying to figure out the sanest architecture for this whole thing.
Expect a lot of breaking changes to the internal APIs.

# Code style

## Backend

All code must be fully PEP8-compliant, even the 79-char width rule. The only exception is test
cases (though I'm thinking about refactoring out test data to make them completely separate from
testing logic; when that happens, test cases must be 79-char max as well).

## Frontend

I admit it's currently a mess. I don't recommend touching it for now, unless you're ready to get
your hands dirty with some ReactJS spaghetti. It's not extremely ugly, but there are certain things
I believe could have been done better (refactor "model" out of React using something like Backbone,
for example).

# Adding support for new manga site

If you want some new site implemented, feel free to create an issue on this GitHub repo.

If you want to implement it yourself, that's even better! To do that, implement your new site in
`./pytaku/sites/your_site_name.py`. For example, let's say you want to implement mangafox.com;
you'll need to create a `Mangafox` class in `./pytaku/sites/mangafox.py`.

This class must have a number of attributes and methods. Check out the implementation of
`Kissmanga` to know what they are (any attr/method whose name doesn't start with `_` is required).
There are also enough comments there to help you understand what each of these methods should do.

Once you have your class in place, you'll need to add an instance of that class into the
`available_sites` list in `./pytaku/sites/__init__py`. Read the codet there, it's quite obvious :)

# About the weird database design

Since I'm using Google App Engine and its shiny "NoSQL" Datastore, I thought I'd try the "NoSQL"
approach: http://bjk5.com/post/54202245691/the-app-engine-way

The general idea is denormalizing all the things to make as few joins as possible when querying,
making "read" actions blazing fast, with the sacrifice of "write" performance (and developer
sanity). The current implementation of Pytaku is not ideal for that yet though. I plan to make
write operations asynchronous where it makes sense so they won't block API responses.

At the end of the day though, I would switch to any traditional relational DB the moment it's
available for free on Google App Engine. NoSQL is the big boys' game. Its performance gain is
negligible at best when used on our scale, which can't justify the ridiculous increase in
complexity.
