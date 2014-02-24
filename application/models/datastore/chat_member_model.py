
from google.appengine.ext import db

class ChatMemberModel(db.Model):
    name = db.TextProperty()
    name_lower = db.StringProperty()
    token = db.StringProperty()
    channel_token = db.TextProperty()
    create_time = db.DateTimeProperty(auto_now_add=True)
