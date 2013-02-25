
from application import app
from handlers.home_handler import *
from handlers.account_handler import *
from handlers.posts_handler import *


# Home
app.add_url_rule('/', 'home', view_func=home, methods=['GET'])

# Login
app.add_url_rule('/login', 'login', view_func=login_page, methods=['GET'])

# Board
app.add_url_rule('/posts', 'posts', view_func=posts, methods=['GET'])
app.add_url_rule('/posts', 'posts_add', view_func=post_add, methods=['POST'])
app.add_url_rule('/posts/<post_id>', 'posts_delete', view_func=post_delete, methods=['DELETE'])

