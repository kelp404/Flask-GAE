# setTimeout
delay = (ms, func) -> setTimeout func, ms
# delay 1000, -> something param


KNotification =
    width: 250
    height: 75
    prefix: 'n_'
    increment_id: 0
    queue: []
    pop: (arg) ->
        ###
        pop notification box.
        ###
        arg.expire ?= 5000
        arg.title ?= ''
        arg.message ?= ''

        nid = @prefix + ++@increment_id
        box = $ '<div id="' + nid + '" class="knotification"><div class="ntitle">' + arg.title + '</div><div class="nmessage">' + arg.message + '</div></div>'
        top = @queue.length * @height
        @queue.push nid
        $('body').append box
        $('#' + nid).css
            right: -@width
            top: top

        #insert notification
        $('#' + nid).animate right: 0, 400, 'easeOutExpo', delay arg.expire, -> KNotification.hide(nid)
        return nid

    hide: (nid) ->
        ###
        hide notification box.
        ###
        @queue = @queue.filter (x) -> x != nid
        remove_top = parseInt $('#' + nid).css 'top'
        $('#' + nid).animate right: -@width, 400, 'easeInExpo', ->
            for id in KNotification.queue
                $box = $('#' + id)
                top = parseInt $box.css 'top'
                if top > remove_top
                    new_top = if $box.attr 'top' then parseInt $box.attr 'top' - KNotification.height else top - KNotification.height
                    $box.attr 'top': new_top
                    $box.dequeue()
                    $box.animate top: new_top, 400, 'easeOutExpo'
            $(@).remove()
        return

window.KNotification = KNotification


core =
    text_loading: 'Loading...'
    is_safari: false
    socket: null

    pop_state: (state) ->
        ###
        pop state ←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙
        ###
        if state
            $('.modal.in').modal 'hide'
            @miko state, false
        return

    miko: (state, push) ->
        ###
        みこ ←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙
        ###
        before_index = $('#nav_bar li.active').index()
        $.ajax
            url: state.href
            type: 'get'
            # fixed flash when pop state in safari
            async: !(core.is_safari and state.is_pop)
            data: state.data
            cache: false
            beforeSend: (xhr) ->
                index = if state.href == '/' then 0 else $('#nav_bar li a[href*="' + state.href + '"]').parent().index()
                core.nav_select index
                xhr.setRequestHeader 'X-Miko', 'miko'
                core.loading_on core.text_loading
            error: (xhr) ->
                core.loading_off()
                core.error_message()
                core.nav_select before_index
            success: (result) ->
                core.loading_off()

                # push state
                if push
                    if state.href != location.pathname or location.href.indexOf('?') >= 0
                        state.nav_select_index = $('#nav_bar li.active').index()
                        history.pushState(state, document.title, state.href)
                    $('html, body').animate scrollTop: 0, 500, 'easeOutExpo'

                miko = result.match(/<!miko>/)
                if !miko
                    location.reload()
                    return

                title = result.match(/<title>(.*)<\/title>/)
                result = result.replace(title[0], '')
                document.title = title[1]
                content = result.match(/\s@([#.]?\w+)/)
                if content
                    # update content
                    $(content[1]).html result.replace(content[0], '')
                core.after_page_loaded()

        return false

    setup_link: ->
        ###
        setup hyper link, form to ajax and push history.
        ###

        # link
        $(document).on 'click', 'a:not([href*="#"])', (e) ->
            # open in a new tab
            if e.metaKey then return

            # menu
            if $(@).closest('.active').length > 0 and $(@).closest('.menu').length > 0
                return false

            href = $(@).attr 'href'
            if href and not $(@).attr 'target'
                core.miko href: href, true
                return false
            return

        # form get
        $(document).on 'submit', 'form[method=get]:not([action*="#"])', ->
            href = $(@).attr 'action' + '?' + $(@).serialize()
            core.miko href: href, true
            return false

        # form post
        $(document).on 'submit', 'form[method=post]:not([action*="#"])', ->
            if core.validation $(@)
                href = $(@).attr 'action'
                core.miko href: href, data: $(@).serialize(), false
            return false

    error_message: ->
        ###
        pop error message.
        ###
        KNotification.pop title: 'Failed', message: 'Loading failed, please try again later.'

    validation: ($form) ->
        ###
        validation ←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙
        ###
        success = true
        $form.find('input, textarea').each ->
            validation = $(@).attr 'validation'
            if validation and validation.length > 0
                if $(@).val().match(validation)
                    $(@).closest('.control-group').removeClass 'error'
                    $(@).parent().find('.error_msg').remove()
                else
                    $(@).closest('.control-group').addClass 'error'
                    $(@).parent().find('.error_msg').remove()
                    if $(@).attr 'msg'
                        $(@).parent().append $('<label for="' + $(@).attr('id') + '" class="error_msg help-inline">' + $(@).attr('msg') + '</label>')
                    success = false
        return success

    setup_datetime: ->
        ###
        datetime ←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙
        ###
        $('.datetime').each ->
            try
                date = new Date $(@).attr('datetime')
                $(@).html date.toFormat $(@).attr('format')

    setup_focus: ->
        ###
        focus ←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙
        ###
        $('.focus').select()

    setup_tooltip: ->
        ###
        tool tip ←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙
        ###
        $('[rel="tooltip"]').tooltip()

    setup_enter_submit: ->
        ###
        .enter-submit.keypress() Ctrl + Enter then submit the form
        ###
        $(document).on 'keypress', '.enter-submit', (e) ->
            if e.keyCode == 13 and e.ctrlKey
                $(@).closest('form').submit()
                return false

    loading_on: ->
        ###
        loading ←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙
        ###
        $('body, a, .table-pointer tbody tr').css cursor: 'wait'
    loading_off: ->
        $('body').css cursor: 'default'
        $('a, .table-pointer tbody tr').css cursor: 'pointer'

    nav_select: (index) ->
        ###
        nav ←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙
        ###
        if index >= 0 and !$($('#nav_bar li')[index]).hasClass 'active'
            $('#nav_bar li').removeClass 'active'
            $($('#nav_bar li')[index]).addClass 'active'
    setup_nav: ->
        match = location.href.match /\w(\/\w*)/
        if match
            index = if match[1] == '/' then 0 else $('#nav_bar li a[href*="' + match[1] + '"]').parent().index()
            $('#nav_bar li').removeClass 'active'
            $($('#nav_bar li')[index]).addClass 'active'

    after_page_loaded: ->
        ###
        events of views ←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙
        ###
        core.setup_datetime()
        core.setup_chat()
        core.setup_focus()
        core.setup_tooltip()

    setup_chat: ->
        ###
        setup_chat ←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙
        ###
        if $('#chat').length > 0
            chat_token = window.sessionStorage['chat_token']
            $.ajax
                type: 'post'
                url: '/chat/setup'
                dataType: 'json'
                cache: false
                data:
                    chat_token: chat_token
                success: (result) ->
                    window.sessionStorage['chat_token'] = result.chat_token
                    $('#chat_name').val result.name
                    channel = new goog.appengine.Channel result.channel_token
                    core.socket = channel.open()
                    # core.socket.onopen = core.chat_on_opened
                    core.socket.onmessage = core.chat_on_message
                    core.socket.onerror = core.chat_on_error
        else if core.socket
            core.socket.close()
    chat_on_message: (msg) ->
        msg = JSON.parse(msg.data)
        if msg.rename
            $('#chat_board').append msg.rename.old_name + ' rename to ' + msg.rename.new_name + '\n'
            $('#chat_name').val msg.rename.new_name
        if msg.message
            $('#chat_board').append msg.name + ': ' + msg.message + '\n'
        $('#chat_board').animate scrollTop: $('#chat_board').prop('scrollHeight'), 500, 'easeOutExpo'
    chat_on_error: ->
        window.sessionStorage.removeItem 'chat_token'
        @setup_chat()

window.core = core

user_agent = navigator.userAgent.toLowerCase()
core.is_safari = user_agent.indexOf('safari') != -1 and user_agent.indexOf('chrome') == -1



# event of views /posts
class ViewEventsPost
    constructor: ->
        @.create_post()
        @.delete_post()
        return @

    create_post: ->
        ###
        create a post
        :param url: $(@).attr('action')
        :param data: $(@).serialize()
        ###
        $(document).on 'submit', 'form#form_create_post', ->
            if !core.validation $(@) then return false

            $.ajax
                type: 'post'
                url: $(@).attr 'action'
                data: $(@).serialize()
                dataType: 'json'
                cache: false
                beforeSend: ->
                    core.loading_on core.text_loading
                error: ->
                    core.loading_off()
                    core.error_message()
                success: (result) ->
                    core.loading_off()
                    if result.success
                        core.miko href: location.href, false
                    else
                        KNotification.pop
                            title: 'Failed'
                            message: 'Please check again.'
            return false

    delete_post: ->
        ###
        delete the post
        :param url: $(@).attr('href')
        ###
        $(document).on 'click', 'a.delete_post', ->
            $.ajax
                type: 'delete'
                url: $(@).attr 'href'
                dataType: 'json'
                cache: false
                beforeSend: ->
                    core.loading_on core.text_loading
                error: ->
                    core.loading_off()
                    core.error_message()
                success: (result) ->
                    core.loading_off()
                    if result.success
                        core.miko href: location.href, false
                    else
                        KNotification.pop
                            title: 'Failed!'
                            message: 'You could not delete this post.'
            return false


# event of views /chat
class ViewEventChat
    constructor: ->
        @.send_msg()
        return @

    send_msg: ->
        $(document).on 'submit', 'form#form_chat_input', ->
            chat_token = window.sessionStorage['chat_token']
            $.ajax
                type: 'post'
                url: '/chat/send_msg'
                dataType: 'json'
                cache: false
                data:
                    token: chat_token
                    msg: $('#chat_msg').val()
                    name: $('#chat_name').val()
                success: (result) ->
                    if result.success
                        $('#chat_msg').val('')
            return false


# event of views
class ViewEvents
    constructor: ->
        new ViewEventsPost()
        new ViewEventChat()
        return @


$ ->
    core.setup_nav()
    core.setup_link()
    core.setup_enter_submit()
    window.onpopstate = (e) -> core.pop_state(e.state)

    # set up events of views
    new ViewEvents()

    # that will be execute after miko call
    core.after_page_loaded()