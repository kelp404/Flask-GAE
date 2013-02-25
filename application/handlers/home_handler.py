
from flask import g, render_template

def home():
    g.view_model['title'] = 'Home - '
    return render_template('home.html', **g.view_model)