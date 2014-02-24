import random
import uuid
import json
import cgi

from google.appengine.api import channel

from application.services.base_service import BaseService
from application.models.datastore.chat_member_model import *


class ChatService(BaseService):
    """
    Chat Service
    """
    def authorization(self, chat_token):
        """
        User authorization.
        :return: ChatMemberModel
        """
        members = db.GqlQuery('select * from ChatMemberModel where token = :1 limit 1', chat_token).fetch(1)
        if members is None or len(members) == 0:
            # insert a new member
            member = ChatMemberModel()
            member.name = 'Guest %s' % str(random.randint(0,10000))
            member.name_lower = member.name.lower()
            member.token = str(uuid.uuid4())
            member.channel_token = channel.create_channel(member.token)
            member.put()
            return member
        else:
            # return exist member
            return members[0]

    def send_message(self, token, message, name):
        """
        Send message by channel API
        :param token: chat token
        :param message: message
        :param name: chat member name
        :return: True / False
        """
        if token is None: return False

        senders = db.GqlQuery('select * from ChatMemberModel where token = :1 limit 1', token).fetch(1)
        if senders is None or len(senders) == 0:
            # token failed
            return False
        sender = ChatMemberModel().get_by_id(senders[0].key().id())

        rename = None
        if name is not None:
            name = name.strip()
            if name.lower() != sender.name_lower:
                # update name
                rename = {
                    'old_name': cgi.escape(sender.name).encode('utf-8', 'xmlcharrefreplace'),
                    'new_name': cgi.escape(name).encode('utf-8', 'xmlcharrefreplace')
                }
                sender.name = name
                sender.name_lower = name.lower()
                sender.put()

        if message is not None:
            message = message.strip()
            message = cgi.escape(message).encode('utf-8', 'xmlcharrefreplace')
        if message is not None and len(message) == 0: message = None

        if message or rename:
            sender_name = cgi.escape(sender.name).encode('utf-8', 'xmlcharrefreplace')
            receivers = ChatMemberModel.all()
            for receiver in receivers:
                channel.send_message(receiver.token, json.dumps({
                    'message': message,
                    'rename': rename,
                    'name': sender_name
                }))
