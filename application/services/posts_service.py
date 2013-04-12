
from flask import g
from application.services.base_service import BaseService
from google.appengine.api import search
from application import config
import datetime
import logging


class PostsService(BaseService):
    """
    Board Service
    """
    def get_posts(self, keyword=None, index=0):
        """
        Get posts with keyword.
        :param keyword: search keyword
        :param index: pager index
        :return: [post], total
        """
        query_string = ''
        if keyword and len(keyword.strip()) > 0:
            source = [item for item in keyword.split(' ') if len(item) > 0]
            plus = [item for item in source if item.find('-') != 0]
            minus = [item[1:] for item in source if item.find('-') == 0 and len(item) > 1]

            if len(plus) > 0:
                keyword = ' '.join(plus)
                query_string = '((title:{1}) OR (content:{1}))'.replace('{1}', keyword)
            if len(minus) > 0:
                keyword = ' '.join(minus)
                query_string = 'NOT ((title:{1}) OR (content:{1}))'.replace('{1}', keyword)

        create_time_desc = search.SortExpression(
            expression = 'create_time',
            direction = search.SortExpression.DESCENDING,
            default_value = '0')
        options = search.QueryOptions(
            offset = config.page_size * index,
            limit = config.page_size,
            sort_options = search.SortOptions(expressions=[create_time_desc]),
            returned_fields = ['title', 'content', 'author', 'create_time'])
        query = search.Query(query_string, options=options)
        try:
            documents = search.Index(name=config.text_search_name).search(query)
        except: # schema missing
            return [], 0

        result = []
        for document in documents:
            result.append({'doc_id': document.doc_id,
                           'title': document.field('title').value,
                           'content': document.field('content').value,
                           'author': document.field('author').value,
                           'deletable': g.user and (g.user['email'] == document.field('author').value or g.user['is_admin']),
                           'create_time': document.field('create_time').value.strftime('%Y-%m-%dT%H:%M:%S.%fZ')})

        # if number of documents over maximum then return the maximum
        if documents.number_found > 1000 + config.page_size:
            count = 1000 + config.page_size
        else:
            count = documents.number_found

        return result, count

    def create_post(self, title, content):
        """
        Create a post.
        :param title: post title
        :param content: post content
        :param author: author's email
        :return: True / False
        """
        # check input value
        if title is None: return False
        if content is None: return False
        title = title.strip()
        content = content.strip()
        if len(title) == 0: return False
        if len(content) == 0: return False

        if g.user:
            author = g.user['email']
        else:
            author = ''

        # insert to text search
        index = search.Index(name=config.text_search_name)
        document = search.Document(fields=[search.TextField(name='title', value=title),
                                                  search.TextField(name='content', value=content),
                                                  search.TextField(name='author', value=author),
                                                  search.DateField(name='create_time', value=datetime.datetime.now())])
        index.put(document)
        return True

    def delete_post(self, post_id):
        """
        Delete the post.
        :param post_id:
        :return: True / False
        """
        if g.user is None or post_id is None: return False

        index = search.Index(name=config.text_search_name)
        if g.user['is_admin']:
            # delete require from admin
            index.delete([post_id])
            return True

        # check post from the same author
        document = index.get(post_id)
        if document.field('author').value == g.user['email']:
            index.delete([post_id])
            return True
        else:
            return False