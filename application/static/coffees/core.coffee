
core =
    ###
    core JavaScript object.
    ###
    is_safari: false
    socket: null

    pop_state: (state) ->
        ###
        pop state
        ###
        if state
            $('.modal.in').modal 'hide'
            state.is_pop = true
            @miko state, false
        return

    miko: (state, push) ->
        ###
        みこ
        :param state: history.state
        :param push: true -> push into history, false do not push into history
        ###
        before_index = $('#nav_bar li.active').index()
        $.ajax
            url: state.href, type: 'get', cache: false, data: state.data
            # fixed flash when pop state in safari
            async: !(core.is_safari and state.is_pop)
            beforeSend: (xhr) ->
                index = if state.href == '/' then 0 else $('#nav_bar li a[href*="' + state.href + '"]').parent().index()
                core.nav_select index
                xhr.setRequestHeader 'X-Miko', 'miko'
                core.loading_on()
            error: ->
                core.loading_off()
                core.error_message()
                core.nav_select before_index
            success: (r) ->
                core.loading_off()

                # push state
                if push
                    if state.href != location.pathname or location.href.indexOf('?') >= 0
                        state.nav_select_index = $('#nav_bar li.active').index()
                        history.pushState(state, document.title, state.href)
                    $('html, body').animate scrollTop: 0, 500, 'easeOutExpo'

                miko = r.match(/<!miko>/)
                if !miko
                    location.reload()
                    return

                title = r.match(/<title>(.*)<\/title>/)
                r = r.replace(title[0], '')
                document.title = title[1]
                content = r.match(/\s@([#.]?\w+)/)
                if content
                    # update content
                    $(content[1]).html r.replace(content[0], '')
                core.after_page_loaded()
        false

    error_message: ->
        ###
        pop error message.
        ###
        KNotification.pop title: 'Failed', message: 'Loading failed, please try again later.'

    validation: ($form) ->
        ###
        validation
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
        success

    loading_on: ->
        ###
        loading
        ###
        $('body, a, .table-pointer tbody tr').css cursor: 'wait'
    loading_off: ->
        $('body').css cursor: 'default'
        $('a, .table-pointer tbody tr').css cursor: 'pointer'

    nav_select: (index) ->
        ###
        nav bar
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

    setup_link: ->
        ###
        setup hyper links and forms to ajax and push history.
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
            href = $(@).attr('action') + '?' + $(@).serialize()
            core.miko href: href, true
            false

        # form post
        $(document).on 'submit', 'form[method=post]:not([action*="#"])', ->
            if core.validation $(@)
                href = $(@).attr 'action'
                core.miko href: href, data: $(@).serialize(), false
            false

    setup_enter_submit: ->
        ###
        .enter-submit.keypress() Ctrl + Enter then submit the form
        ###
        $(document).on 'keypress', '.enter-submit', (e) ->
            if e.keyCode == 13 and e.ctrlKey
                $(@).closest('form').submit()
                false

    after_page_loaded: ->
        ###
        events of views
        ###
        core.setup_datetime()
        core.setup_focus()
        core.setup_tooltip()
        core.setup_chat()

    setup_datetime: ->
        ###
        datetime
        ###
        $('.datetime').each ->
            try
                date = new Date $(@).attr('datetime')
                $(@).html date.toFormat $(@).attr('format')

    setup_focus: ->
        ###
        focus
        ###
        $('.focus').select()

    setup_tooltip: ->
        ###
        tool tip
        ###
        $('[rel="tooltip"]').tooltip()

    setup_chat: ->
        ###
        setup_chat
        ###
        if $('#chat').length > 0
            chat_token = window.sessionStorage['chat_token']
            $.ajax
                type: 'post', url: '/chat/setup', dataType: 'json', cache: false
                data:
                    chat_token: chat_token
                success: (r) ->
                    window.sessionStorage['chat_token'] = r.chat_token
                    $('#chat_name').val r.name
                    channel = new goog.appengine.Channel r.channel_token
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
