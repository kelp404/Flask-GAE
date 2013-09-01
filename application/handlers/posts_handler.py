
from flask import g, render_template, request, jsonify, abort
from application.services.posts_service import *
from application.models.form.post_form import *

def posts():
    """
    search posts
    :return:
    """
    try: index = int(request.args.get('index'))
    except: index = 0
    keyword = request.args.get('keyword')
    if keyword is None: keyword = ''
    g.view_model['keyword'] = keyword

    g.view_model['title'] = 'Board - '

    ps = PostsService()
    result, total = ps.get_posts(keyword, index)
    g.view_model['page'] = {
        'items': result,
        'total': total,
        'index': index,
        'size': config.page_size,
        'max': (total - 1) / config.page_size
    }

    return render_template('board.html', **g.view_model)

def post_add():
    """
    create a post
    :return:
    """
    post = PostForm(request.form)
    if not post.validate():
        return abort(400)
    title = request.form.get('title')
    content = request.form.get('content')

    ps = PostsService()
    ps.create_post(title, content)

    return posts()

def post_delete(post_id=None):
    """
    delete the post
    :param post_id: text search document id
    :return:
    """
    ps = PostsService()
    success = ps.delete_post(post_id)

    return jsonify({'success': success})