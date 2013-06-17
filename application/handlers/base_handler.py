
# flask
from flask import render_template, g, request

# google
from google.appengine.api import users

# application
import gae_mini_profiler
from gae_mini_profiler.templatetags import profiler_includes
from application import app, config
from application.services.account_service import *



@app.before_request
def before_request():
    g.view_model = {
        'compressed': config.compressed_resource,
        'profiler_includes': gae_mini_profiler.templatetags.profiler_includes(),
        'title': '',
        'title_prefix': config.app_name
    }
    # Authorization
    acs = AccountService()
    g.user = acs.authorization()
    g.view_model['user'] = g.user
    if g.user:
        g.view_model['logout_url'] = users.create_logout_url('/')
    else:
        g.view_model['login_url'] = users.create_login_url()

    # miko framework
    # miko result
    # True: result content
    # False: result all page
    g.view_model['miko'] = 'X-Miko' in request.headers


@app.errorhandler(404)
def error_404(e):
    return render_template('_error_default.html', status=404, exception=e), 404
@app.errorhandler(405)
def error_405(e):
    return render_template('_error_default.html', status=405, exception=e), 405
@app.errorhandler(500)
def error_500(e):
    return render_template('_error_default.html', status=500, exception=e), 500
@app.errorhandler(503)
def error_503(e):
    return render_template('_error_default.html', status=503, exception=e), 503
