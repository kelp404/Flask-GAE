

class MemcacheKey:
    @staticmethod
    def chat_member(chat_token):
        """
        Get a cache key for chat member.

        :param chat_token: chat token
        :return: cache key
        """
        return 'chat_member_%s' % chat_token
