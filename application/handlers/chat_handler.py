
from flask import g, render_template, jsonify, request
from application.services.chat_service import *


def chat():
    """
    chat page.
    :return:
    """
    g.view_model['title'] = 'Chat - '
    return render_template('chat.html', **g.view_model)

def chat_setup():
    """
    set up chat.
    :return:
    """
    chat_token = request.form.get('chat_token')
    cs = ChatService()
    member = cs.authorization(chat_token)

    return jsonify({ 'name': member.name, 'chat_token': member.token, 'channel_token': member.channel_token })

def chat_send_message():
    """
    send a message handler.
    :return:
    """
    msg = request.form.get('msg')
    name = request.form.get('name')
    token = request.form.get('token')

    cs = ChatService()
    cs.send_message(token, msg, name)
    return jsonify({ 'success': True })