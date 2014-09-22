# Import 3rd-party libraries stored in ./lib
import sys
sys.path.insert(0, 'lib')

# Import a bunch of GAE's libs
from dev_appserver import fix_sys_path
fix_sys_path()

import nose

nose.main()
