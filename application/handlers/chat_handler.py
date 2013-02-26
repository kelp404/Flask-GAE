
from flask import g, render_template, jsonify, request
from google.appengine.api.channel import *
from google.appengine.api import memcache
from application.models.memcache_key import *
from application.models.chat_member_model import *
import random, uuid


def chat():
    g.view_model['title'] = 'Chat - '
    return render_template('chat.html', **g.view_model)

def chat_setup():
    chat_token = request.form.get('chat_token')
    if chat_token is None or len(chat_token) == 0:
        # return a new member
        member = __generate_member()
        return jsonify({ 'name': member.name, 'token': member.token })

    cache_key = MemcacheKey.chat_member(chat_token)
    member = memcache.get(key=cache_key)
    if member:
        # member exist
        return jsonify({ 'name': member.name, 'token': member.token })
    else:
        # return a new member
        member = __generate_member()
        return jsonify({ 'name': member.name, 'token': member.token })


def __generate_member():
    member = ChatMember()
    member.name = 'Guest %s' % str(random.randint(0,10000))
    member.token = str(uuid.uuid4())

    cache_key = MemcacheKey.chat_member(member.token)
    memcache.set(key=cache_key, value=member)

    return member