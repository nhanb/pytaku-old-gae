# Import 3rd-party libraries stored in ./lib
import vendor
vendor.add('lib')

# Import a bunch of GAE's libs
from dev_appserver import fix_sys_path
fix_sys_path()

from google.appengine.ext import testbed
t = testbed.Testbed()
t.activate()
t.init_urlfetch_stub()

import nose

nose.main()
