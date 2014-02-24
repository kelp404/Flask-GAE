import webapp2
from google.appengine.ext import db
from google.appengine.api import search
import datetime
import config


class ClearPostsHandler(webapp2.RequestHandler):
    """
    Clear posts handler.
    """
    def get(self):
        # clear posts
        date_tag = datetime.datetime.now() - datetime.timedelta(days=config.post_expiration)
        options = search.QueryOptions(returned_fields=['doc_id'])
        query = search.Query(query_string='create_time<=%s' % date_tag.strftime('%Y-%m-%d'), options=options)
        self.__delete_text_search(config.text_search_name, query)

        # clear channel
        date_tag = datetime.datetime.now() - datetime.timedelta(days=config.channel_expiration)
        self.__delete_data_store('ChatMemberModel', date_tag)


    def __delete_text_search(self, model_name, query):
        """
        delete expired text search documents.
        :param model_name: text search schema
        :param query: expiration
        :return:
        """
        index = search.Index(name=model_name)
        while True:
            documents = index.search(query)
            if documents.number_found == 0: break

            # delete document in text search
            document_ids = [x.doc_id for x in documents]
            index.delete(document_ids)

    def __delete_data_store(self, model_name, date_tag):
        """
        delete expired data store entities.
        :param model_name: data store model name
        :param date_tag: expiration
        :return:
        """
        while True:
            query = db.GqlQuery('select * from %s where create_time < :1' % model_name, date_tag)
            if query.count(1) == 0: break
            models = query.fetch(1000)
            db.delete(models)


app = webapp2.WSGIApplication([
    ('/cron_jobs/post', ClearPostsHandler)
])