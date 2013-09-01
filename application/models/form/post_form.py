from wtforms import TextField, validators, Form



class PostForm(Form):
    title = TextField('title',
                     validators=[validators.length(min=1, max=25)],
                     filters=[lambda x: x.strip() if isinstance(x, basestring) else None])

    content = TextField('content',
                     validators=[validators.length(min=1, max=200)],
                     filters=[lambda x: x.strip() if isinstance(x, basestring) else None])