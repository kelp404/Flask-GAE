
/* notification */
var KNotification = KNotification || {
    width: 250,
    height: 75,
    prefix: 'n_',
    increment_id: 0,
    queue: [],
    hide: function (nid) {
        for (var index = 0; index < KNotification.queue.length; index ++) {
            var item = KNotification.queue.shift();
            if (item == nid) { break; }
            else { KNotification.queue.push(item); }
        }
        var remove_top = parseInt($('#' + nid).css('top'));
        $('#' + nid).animate({ right: -KNotification.width }, 400, 'easeInExpo', function () {
            $(KNotification.queue).each(function (index) {
                var top = parseInt($('#' + KNotification.queue[index]).css('top'));
                if (top > remove_top) {
                    top = $('#' + KNotification.queue[index]).attr('top') == undefined ? top - KNotification.height : parseInt($('#' + KNotification.queue[index]).attr('top')) - KNotification.height;
                    $('#' + KNotification.queue[index]).attr('top', top);
                    $('#' + KNotification.queue[index]).dequeue();
                    $('#' + KNotification.queue[index]).animate({ top: top }, 400, 'easeOutExpo');
                }
            });
            $(this).remove();
        });
    },
    pop: function (arg) {
        var arg = arg || {};
        arg.expire = arg.expire || 5000;
        arg.title = arg.title || '';
        arg.message = arg.message || '';
        var nid = KNotification.prefix + ++KNotification.increment_id;
        var box = $('<div id="' + nid + '" class="knotification"><div class="ntitle">' + arg.title + '</div><div class="nmessage">' + arg.message + '</div></div>');
        var top = KNotification.queue.length * KNotification.height;
        KNotification.queue.push(nid);
        $('body').append(box);
        $('#' + nid).css('right', -KNotification.width);
        $('#' + nid).css('top', top);

        // insert notification
        $('#' + nid).animate({ right: 0 }, 400, 'easeOutExpo', function () {
            if (arg.expire >= 0) {
                setTimeout(function () {
                    // remove notification
                    KNotification.hide(nid);
                }, arg.expire);
            }
        });

        return nid;
    }
};


/* core */
var core = core || {
    text_loading: 'Loading...',
    is_safari: false,
    // みこ ←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙
    pop_state: function (state) {
        if (state) {
            $('.modal.in').modal('hide');
            state.is_pop = true;
            core.miko(state, false);
        }
    },
    miko: function(state, push) {
        var before_index = $('#nav_bar li.active').index();
        $.ajax({ url: state.href,
            type: 'get',
            // fixed flash when pop state in safari
            async: !(core.is_safari && state.is_pop),
            data: state.data,
            cache: false,
            beforeSend: function (xhr) {
                var index = state.href == '/' ? 0 : $('#nav_bar li a[href*="' + state.href + '"]').parent().index();
                core.nav_select(index);

                xhr.setRequestHeader('X-Miko', 'miko');
                core.loading_on(core.text_loading);
            },
            error: function (xhr) {
                core.loading_off();
                core.error_message();
                core.nav_select(before_index);
            },
            success: function (result) {
                core.loading_off();

                // push state
                if (push) {
                    if (state.href != location.pathname || location.href.indexOf('?') >= 0) {
                        state.nav_select_index = $('#nav_bar li.select').index();
                        history.pushState(state, document.title, state.href);
                    }
                    $('html,body').animate({scrollTop: (0)}, 500, 'easeOutExpo');
                }

                var miko = result.match(/<!miko>/);
                if (!miko) {
                    // the result is not miko content
                    location.reload();
                    return;
                }

                var title = result.match(/<title>(.*)<\/title>/);
                result = result.replace(title[0], '');
                document.title = title[1];
                var content = result.match(/\s@([#.]?\w+)/);
                if (content) {
                    // update content
                    $(content[1]).html(result.replace(content[0], ''));
                }
                core.setup_datetime();
                core.setup_focus();
                core.setup_tooltip();
            }
        });
    },
    setup_link: function() {
        // link
        $(document).on('click', 'a:not([href*="#"])', function (e) {
            // open in a new tab
            if (e.metaKey) { return; }

            // menu
            if ($(this).closest('.active').length > 0 && $(this).closest('.menu').length > 0) { return false; }

            var href = $(this).attr('href');
            if (href && !$(this).attr('target')) {
                core.miko({ href: href }, true);
                return false;
            }
        });
        // from get
        $(document).on('submit', 'form[method=get]:not([action*="#"])', function () {
            var href = $(this).attr('action') + '?' + $(this).serialize();
            core.miko({ href: href }, true);
            return false;
        });
        // from post
        $(document).on('submit', 'form[method=post]:not([action*="#"])', function () {
            if (core.validation($(this))) {
                var href = $(this).attr('action');
                core.miko({ href: href, data: $(this).serialize() }, false);
            }
            return false;
        });
    },

    error_message: function () {
        KNotification.pop({ title: 'Failed', message: 'Loading failed, please try again later.' });
    },

    // validation ←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙
    validation: function ($form) {
        var success = true;
        $form.find('input, textarea').each(function () {
            var validation = $(this).attr('validation');
            if (validation && validation.length > 0) {
                if ($(this).val().match(validation)) {
                    $(this).closest('.control-group').removeClass('error');
                    $(this).parent().find('.error_msg').remove();
                }
                else {
                    $(this).closest('.control-group').addClass('error');
                    $(this).parent().find('.error_msg').remove();
                    if ($(this).attr('msg')) {
                        $(this).parent().append($('<label for="' + $(this).attr('id') + '" class="error_msg help-inline">' + $(this).attr('msg') + '</label>'));
                    }
                    success = false;
                }
            }
        });

        return success;
    },

    // datetime ←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙
    setup_datetime: function () {
        $('.datetime').each(function () {
            var date = new Date($(this).attr('datetime'));
            $(this).html(date.toFormat($(this).attr('format')));
        });
    },

    // focus ←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙
    setup_focus: function () {
        $('.focus').select();
    },

    // tool tip ←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙
    setup_tooltip: function () {
        $("[rel='tooltip']").tooltip();
    },

    // loading ←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙
    loading_on: function (message) {
        $('body, a, .table-pointer tbody tr').css('cursor', 'wait');
    },
    loading_off: function () {
        $('body').css('cursor', 'default');
        $('a, .table-pointer tbody tr').css('cursor', 'pointer');
    },

    // nav ←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙
    nav_select: function (index) {
        if (index >= 0 && !$($('#nav_bar li')[index]).hasClass('active')) {
            $('#nav_bar li').removeClass('active');
            $($('#nav_bar li')[index]).addClass('active');
        }
    },
    setup_nav: function () {
        var match = location.href.match(/\w(\/\w*)/);
        if (match) {
            var index = match[1] == '/' ? 0 : $('#nav_bar li a[href*="' + match[1] + '"]').parent().index();
            $('#nav_bar li').removeClass('active');
            $($('#nav_bar li')[index]).addClass('active');
        }
    },

    // events of views ←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙←↖↑↗→↘↓↙
    register_event_enter_submit: {
        enter_submit: function () {
            // .enter-submit.keypress() Ctrl + Enter then submit the form
            $(document).on('keypress', '.enter-submit', function (e) {
                if (e.keyCode == 13 && e.ctrlKey) {
                    $(this).closest('form').submit();
                    return false;
                }
            });
        }
    },
    register_event_posts: {
        create_post: function () {
            // create post
            //  url = $(this).attr('action')
            //  data = $(this).serialize()
            $(document).on('submit', 'form#form_create_post', function () {
                if (!core.validation($(this))) { return false; }

                $.ajax({ type: 'post', url: $(this).attr('action'), dataType: 'json', cache: false,
                    data: $(this).serialize(),
                    beforeSend: function () { core.loading_on(core.text_loading); },
                    error: function (xhr) { core.loading_off(); core.error_message(); },
                    success: function (result) {
                        core.loading_off();
                        if (result.success) {
                            core.miko({ href: location.href }, false);
                        }
                        else {
                            KNotification.pop({ 'title': 'Failed!', 'message': 'Please check again.' });
                        }
                    }
                });

                return false;
            });
        },
        delete_post: function () {
            // delete post
            //  url = $(this).attr('href')
            $(document).on('click', 'a.delete_post', function () {
                $.ajax({ type: 'delete', url: $(this).attr('href'), dataType: 'json', cache: false,
                    beforeSend: function () { core.loading_on(core.text_loading); },
                    error: function (xhr) { core.loading_off(); core.error_message(); },
                    success: function (result) {
                        core.loading_off();
                        if (result.success) {
                            core.miko({ href: location.href }, false);
                        }
                        else {
                            KNotification.pop({ 'title': 'Failed!', 'message': 'You could not delete this post.' });
                        }
                    }
                });

                return false;
            });
        }
    },
    setup_events: function () {
        // all setup event object should be a member in core{}, and name 'register_event_xxxx'
        // all functions in setup event objects will be execute on document.ready()
        for (var member in core) {
            if (member.indexOf('register_event_') == 0) {
                for (var fn in core[member]) {
                    if (typeof core[member][fn] == "function") {
                        // execute
                        core[member][fn]();
                    }
                }
            }
        }
    }
};
var user_agent = navigator.userAgent.toLowerCase();
core.is_safari = user_agent.indexOf('safari') != -1 && user_agent.indexOf('chrome') == -1;

$(document).ready(function () {
    core.setup_nav();
    core.setup_link();

    // set up events of views
    core.setup_events();

    // that will be execute after miko call
    // set up datetime display
    core.setup_datetime();
    core.setup_focus();
    core.setup_tooltip();
});