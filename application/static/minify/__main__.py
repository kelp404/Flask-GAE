
"""
    minify core.js to core.min.js

    $ cd applicatioin/static
    $ python minify
"""


from slimit import minify

# read base javascript
base = open('./javascripts/base.min.js', 'r').read()
# read core.js and minify
core = minify(open('./coffees/core.js', 'r').read(), mangle=True, mangle_toplevel=True)

# write to the file
f = open('./javascripts/core.min.js', 'w')
f.write(base)
f.write("\n\n")
f.write(core)