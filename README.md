#Flask on Google App Engine Template

Kelp http://kelp.phate.org/  
[MIT License][mit]  
[MIT]: http://www.opensource.org/licenses/mit-license.php

```
   ______   __         ______     ______     __  __
  /\  ___\ /\ \       /\  __ \   /\  ___\   /\ \/ /
  \ \  __\ \ \ \____  \ \  __ \  \ \___  \  \ \  _"-.
   \ \_\    \ \_____\  \ \_\ \_\  \/\_____\  \ \_\ \_\
    \/_/     \/_____/   \/_/\/_/   \/_____/   \/_/\/_/
```

This project is my <a href="https://developers.google.com/appengine/" target="_blank">GAE</a> project template.  
And uses <a href="http://www.whatwg.org/specs/web-apps/current-work/#history-0" target="_blank">History</a> to link pages, so that all hyperlinks are ajax.  


##Frameworks
+ Flask 0.9 Jan 29, 2013 @bfeee75
+ Jinja 2.6 Sep 15, 2012 @21a2010
+ Werkzeug 0.8.3 Feb 20, 2013 @9d53c19
+ Bootstrap 2.3
+ jQuery 1.9.1



##How to use?
./
```Python
-/application       # Web application code
-/flask             # Flask framework
-/gae_mini_profiler # GAE mini profiler
-/jinja2            # Jinja framework
-/tests             # Unit tests
-/werkzeug          # Werkzeug framework
- app.yaml          # GAE app config
- backends.yaml     # GAE backends config
- config.py         # Application config
- cron_jobs.py      # Cron jobs code
- cron.yaml         # GAE Cron jobs config
- index.yaml        # GAE datasotre indexes config
```

./application/
```Python
-/data_modelsflask  # Datastore data model
-/handlers          # Web handlers (MVC's controller)
-/models            # Other models
-/services          # All business logic here (MVC's model)
-/static
    -/css
    -/icon
    -/imgs
    -/javascripts
    -/minify      # JavaScript minify tool
    - robots.txt
-/templates         # Jinja templates (MVC's view)
-/utilities         # Web application's shared utilities(helpers)
- __init__.py
- routes.py         # Web application's routers
```


##Example application
Board: <a href="https://flask-gae-kelp.appspot.com/posts" target="_blank">https://flask-gae-kelp.appspot.com/board</a>  
Chat: <a href="https://flask-gae-kelp.appspot.com/chat" target="_blank">https://flask-gae-kelp.appspot.com/chat</a>  


##appcfg.py
**Update backends**
```
appcfg.py backends myapp/ update
```

**Deleting Unused Indexes on Google App Engine**
```
appcfg.py vacuum_indexes myapp/
# https://developers.google.com/appengine/docs/python/tools/uploadinganapp?hl=en#Deleting_Unused_Indexes
```


##JavaScript minify
All JavaScript should write in /application/static/javascripts/core.js, do not write in *.html.
```
$ cd Flask-GAE/applicatioin/static
$ python minify
```


##Unittest
Before test, you should run GAE local server, and clear datastore, text search, and update url in function 'setUp()'.
```Python
class TestTakanashiFunctions(unittest.TestCase):
    def setUp(self):
        self.url = 'http://localhost:8081'
        self.email = 'kelp@phate.org'
        self.cookies = { 'dev_appserver_login': "kelp@phate.org:True:111325016121394242422" }
```
clear datastore & text search:
```
--clear_datastore --clear_search_indexes
```
```
$ cd Flask-GAE
$ python tests
```
Python unit test reference: <a href="http://docs.python.org/2/library/unittest.html" target="_blank">http://docs.python.org/2/library/unittest.html</a>



##References
+ <a href="https://developers.google.com/appengine/docs/python/overview" target="_blank">App Engine Python Overview</a>
+ <a href="https://github.com/mitsuhiko/flask" target="_blank">Flask on GitHub</a>
(<a href="http://flask.pocoo.org/" target="_blank">document</a>)
+ <a href="https://github.com/mitsuhiko/jinja2" target="_blank">Jinja2 on GitHub</a>
(<a href="http://jinja.pocoo.org/" target="_blank">document</a>)
+ <a href="https://github.com/mitsuhiko/werkzeug" target="_blank">Werkzeug on GitHub</a>
(<a href="http://werkzeug.pocoo.org/" target="_blank">document</a>)
+ <a href="https://github.com/mitsuhiko/itsdangerous" target="_blank">itsdangerous on GitHub</a>
+ <a href="https://github.com/kamens/gae_mini_profiler" target="_blank">Google App Engine Mini Profiler on GitHub</a>
+ <a href="https://github.com/rspivak/slimit" target="_blank">SlimIt on GitHub</a>
+ <a href="http://twitter.github.com/bootstrap/" target="_blank">Bootstrap</a>
+ <a href="http://jquery.com/" target="_blank">jQuery</a>
