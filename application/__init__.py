
from flask import Flask
import config

app = Flask(__name__)
app.config.from_object('application.config')

# set up router
from handlers import base_handler
import routes
