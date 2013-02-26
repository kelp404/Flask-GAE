
from google.appengine.ext import db

class ChatMemberModel(db.Model):
    name = db.TextProperty()
    token = db.StringProperty()

