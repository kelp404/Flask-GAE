
from google.appengine.ext import db

class PostModel(db.Model):
    title = db.TextProperty()
    content = db.TextProperty()
    email = db.StringProperty()
    create_time = db.DateTimeProperty(auto_now_add=True)
