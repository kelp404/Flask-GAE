
from application.services.base_service import BaseService
from google.appengine.api import users
import logging


class AccountService(BaseService):
    """
    Account Service
    """
    def authorization(self):
        """
        User authorization.
        :return: { 'email': '', 'is_admin': False } / None
        """
        google_user = users.get_current_user()
        if google_user is None:
            return None
        else:
            return { 'email': google_user.email().lower(), 'is_admin': users.is_current_user_admin() }
