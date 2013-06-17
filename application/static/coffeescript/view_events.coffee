
class ViewEventsPost
    ###
    event of views /posts
    ###
    constructor: ->
        @delete_post()

    delete_post: ->
        ###
        delete the post
        :param url: $(@).attr('href')
        ###
        $(document).on 'click', 'a.delete_post', ->
            $.ajax
                type: 'delete', url: $(@).attr('href'), dataType: 'json', cache: false
                beforeSend: ->
                    core.loading_on()
                error: ->
                    core.loading_off()
                    core.error_message()
                success: (r) ->
                    core.loading_off()
                    if r.success
                        core.miko href: location.href, false
                    else
                        $.av.pop {title: 'Error', message: 'You could not delete this post.', template: 'error'}
            false


class ViewEventChat
    ###
    event of views /chat
    ###
    constructor: ->
        @send_msg()
        @chat_board_readonly()

    send_msg: ->
        $(document).on 'submit', 'form#form_chat_input', ->
            chat_token = window.sessionStorage['chat_token']
            $.ajax
                type: 'post', url: $(@).attr('action'), dataType: 'json', cache: false
                data:
                    token: chat_token
                    msg: $('#chat_msg').val()
                    name: $('#chat_name').val()
                success: (r) ->
                    if r.success
                        $('#chat_msg').val('')
            false

    chat_board_readonly: ->
        $(document).on 'keypress', '#chat_board', -> false


# event of views
class ViewEvents
    constructor: ->
        new ViewEventsPost()
        new ViewEventChat()


$ ->
    # setup core
    core.setup()

    # setup events of views
    new ViewEvents()

    # that will be executed after miko call
    core.after_page_loaded()