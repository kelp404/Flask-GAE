import unittest
from datetime import datetime
from mock import MagicMock, patch
from application.models.datastore.chat_member_model import *

class TestPostModel(unittest.TestCase):
    def test_chat_member_model_properties(self):
        # mock google.appengine.ext.db
        self.patchers = [
            patch('google.appengine.ext.db.StringProperty.validate', new=MagicMock(return_value='StringProperty')),
            patch('google.appengine.ext.db.TextProperty.validate', new=MagicMock(return_value='TextProperty')),
        ]
        for patcher in self.patchers:
            patcher.start()

        member = ChatMemberModel()
        self.assertEqual(member.name, 'TextProperty')
        self.assertEqual(member.name_lower, 'StringProperty')
        self.assertEqual(member.token, 'StringProperty')
        self.assertEqual(member.channel_token, 'TextProperty')
        self.assertTrue(isinstance(member.create_time, datetime))

        for patcher in self.patchers:
            patcher.stop()
