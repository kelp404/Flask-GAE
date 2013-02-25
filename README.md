#Flask on Google App Engine Template

Kelp http://kelp.phate.org/  
[MIT License][mit]  
[MIT]: http://www.opensource.org/licenses/mit-license.php


This project is my <a href="https://developers.google.com/appengine/" target="_blank">GAE</a> project template.  
And uses <a href="http://www.whatwg.org/specs/web-apps/current-work/#history-0" target="_blank">History</a> to link pages, so that all hyperlinks are ajax.  


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
    -/minifier      # JavaScript minifier tool
    - robots.txt
-/templates         # Jinja templates (MVC's view)
-/utilities         # Web application's shared utilities
- __init__.py
- routes.py         # Web application's routers
```


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



##References
+ <a href="https://developers.google.com/appengine/docs/python/overview" target="_blank">App Engine Python Overview</a>
+ <a href="https://github.com/mitsuhiko/flask" target="_blank">Flask on GitHub</a>
(<a href="http://flask.pocoo.org/" target="_blank">document</a>)
+ <a href="https://github.com/mitsuhiko/jinja2" target="_blank">Jinja2 on GitHub</a>
(<a href="http://jinja.pocoo.org/" target="_blank">document</a>)
+ <a href="https://github.com/mitsuhiko/werkzeug" target="_blank">Werkzeug on GitHub</a>
(<a href="http://werkzeug.pocoo.org/" target="_blank">document</a>)
+ <a href="https://github.com/kamens/gae_mini_profiler" target="_blank">Google App Engine Mini Profiler on GitHub</a>
+ <a href="https://github.com/rspivak/slimit" target="_blank">SlimIt on GitHub</a>
+ <a href="http://jquery.com/" target="_blank">jQuery</a>
