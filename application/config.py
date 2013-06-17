# -*- coding: utf-8 -*-

app_name = 'Flask on GAE'

# posts text search name
text_search_name = 'PostSchema'

# delete documents after x days
post_expiration = 30
channel_expiration = 2

# data result pager size
page_size = 10


import os
DEBUG_MODE = False
# Auto-set debug mode based on App Engine dev environ
if 'SERVER_SOFTWARE' in os.environ and os.environ['SERVER_SOFTWARE'].startswith('Dev'):
    DEBUG_MODE = True
DEBUG = DEBUG_MODE

compressed_resource = not DEBUG
