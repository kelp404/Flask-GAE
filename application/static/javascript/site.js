(function() {
  var core, user_agent;

  core = {

    /*
    core JavaScript object.
     */
    if_first_pop: true,
    text_loading: 'Loading...',
    is_safari: false,
    is_ie: false,
    socket: null,
    is_modal_pop: false,
    did_load_func: {},
    setup: function() {

      /*
      setup core
       */
      this.setup_nav();
      this.setup_link();
      this.setup_enter_submit();
      return window.onpopstate = (function(_this) {
        return function(e) {
          return _this.pop_state(e.state);
        };
      })(this);
    },
    pop_state: function(state) {

      /*
      pop state
       */
      if (this.if_first_pop) {
        this.if_first_pop = false;
        return;
      }
      if (this.is_modal_pop) {
        this.is_modal_pop = false;
        return;
      }
      if (state) {
        state.is_pop = true;
        this.ajax(state, false);
      } else {
        state = {
          is_pop: true,
          href: location.pathname
        };
        this.ajax(state, false);
      }
    },
    ajax: function(state, push) {

      /*
      Load the page with ajax.
      :param state: history.state
          {
              method,     # ajax http method
              href,       # ajax http url
              data,       # ajax
              is_pop,     # true: user click back or forward
              is_modal    # true: show detail by modal. do not invoke ajax when history.back()
          }
      :param push: true -> push into history, false do not push into history
       */
      var before_index;
      before_index = $('#js_navigation li.cs_active').index();
      if (state.method == null) {
        state.method = 'get';
      }
      if (state.method !== 'get') {
        push = false;
      }
      $.ajax({
        url: state.href,
        type: state.method,
        cache: false,
        data: state.data,
        async: !(core.is_safari && state.is_pop),
        beforeSend: function(xhr) {
          var index;
          index = state.href === '/' ? 0 : $("#js_navigation li a[href*='" + state.href + "']").parent().index();
          core.nav_select(index);
          xhr.setRequestHeader('X-ajax', 'ajax');
          return core.loading_on(core.text_loading);
        },
        error: function(r) {
          core.loading_off();
          core.error_message(r.status);
          return core.nav_select(before_index);
        },
        success: function(r, status, xhr) {
          var $content, $control, content_type, is_ajax, key, msg, _i, _len, _ref;
          if (r.__redirect) {
            core.ajax({
              href: r.__redirect
            }, true);
            return;
          }
          core.loading_off();
          content_type = xhr.getResponseHeader("content-type");
          if (content_type.indexOf('json') >= 0 && r.__status === 400) {
            _ref = Object.keys(r);
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              key = _ref[_i];
              msg = r[key];
              $control = $("#" + key).closest('.control-group');
              $control.find('.help-inline').remove();
              if (msg) {
                $control.addClass('error');
                $control.find('.controls').append($("<label for='" + key + "' class='help-inline'>" + msg + "</label>"));
              } else {
                $control.removeClass('error');
              }
            }
            return;
          }
          $('.modal.in').modal('hide');
          if (push) {
            if (state.href !== location.pathname || location.href.indexOf('?') >= 0) {
              history.pushState(state, document.title, state.href);
            }
            $('html, body').animate({
              scrollTop: 0
            }, 500, 'easeOutExpo');
          } else {
            if (history.state && history.state.is_modal) {
              core.is_modal_pop = true;
              history.back();
            }
          }
          is_ajax = r.match(/<!ajax>/);
          if (!is_ajax) {
            location.reload();
            return;
          }
          r = r.replace(/<!ajax>/, '');
          $content = $("<div id='js_root'>" + r + "</div>");
          document.title = $content.find('title').text();
          $content.find('.js_ajax').each(function() {
            var target;
            target = $(this).attr('data-ajax-target');
            $("#" + target).html($(this).find("#" + target).html());
            $("#" + target).attr('class', $(this).find("#" + target).attr('class'));
          });
          return core.after_page_loaded();
        }
      });
      return false;
    },
    error_message: function() {

      /*
      pop error message.
       */
      return $.av.pop({
        title: 'Error',
        message: 'Loading failed, please try again later.',
        template: 'error'
      });
    },
    validation: function($form) {

      /*
      validation
       */
      var success;
      success = true;
      $form.find('input, textarea').each(function() {
        var validation;
        validation = $(this).attr('validation');
        if (validation && validation.length > 0) {
          if ($(this).val().match(validation)) {
            $(this).closest('.control-group').removeClass('error');
            return $(this).parent().find('.error_msg').remove();
          } else {
            $(this).closest('.control-group').addClass('error');
            $(this).parent().find('.error_msg').remove();
            if ($(this).attr('msg')) {
              $(this).parent().append($('<label for="' + $(this).attr('id') + '" class="error_msg help-inline">' + $(this).attr('msg') + '</label>'));
            }
            return success = false;
          }
        }
      });
      return success;
    },
    loading_on: function() {

      /*
      loading
       */
      return $('body, a, .table-pointer tbody tr').css({
        cursor: 'wait'
      });
    },
    loading_off: function() {
      $('body').css({
        cursor: 'default'
      });
      return $('a, .table-pointer tbody tr').css({
        cursor: 'pointer'
      });
    },
    nav_select: function(index) {

      /*
      nav bar
       */
      if (index >= 0 && !$($('#js_navigation li')[index]).hasClass('active')) {
        $('#js_navigation li').removeClass('active');
        return $($('#js_navigation li')[index]).addClass('active');
      }
    },
    setup_nav: function() {
      var index, match;
      match = location.href.match(/\w(\/\w*)/);
      if (match) {
        index = match[1] === '/' ? 0 : $('#js_navigation li a[href*="' + match[1] + '"]').parent().index();
        $('#js_navigation li').removeClass('active');
        return $($('#js_navigation li')[index]).addClass('active');
      }
    },
    setup_link: function() {

      /*
      setup hyper links and forms to ajax and push history.
       */
      if (this.is_ie) {
        return;
      }
      $(document).on('click', 'a:not([href*="#"])', function(e) {
        var href;
        if (e.metaKey) {
          return;
        }
        if ($(this).closest('.active').length > 0 && $(this).closest('.menu').length > 0) {
          return false;
        }
        href = $(this).attr('href');
        if (href && !$(this).attr('target')) {
          core.ajax({
            href: href
          }, true);
          return false;
        }
      });
      $(document).on('submit', 'form[method=get]:not([action*="#"])', function() {
        var href;
        href = $(this).attr('action') + '?' + $(this).serialize();
        core.ajax({
          href: href
        }, true);
        return false;
      });
      return $(document).on('submit', 'form[method=post]:not([action*="#"])', function() {
        var href;
        if (core.validation($(this))) {
          href = $(this).attr('action');
          core.ajax({
            href: href,
            data: $(this).serialize(),
            method: 'post'
          });
          $('.modal.in').modal('hide');
        }
        return false;
      });
    },
    setup_enter_submit: function() {

      /*
      .enter-submit.keypress() Ctrl + Enter then submit the form
       */
      return $(document).on('keypress', '.enter-submit', function(e) {
        if (e.keyCode === 13 && e.ctrlKey) {
          $(this).closest('form').submit();
          return false;
        }
      });
    },
    after_page_loaded: function() {

      /*
      events of views
       */
      core.setup_datetime();
      core.setup_focus();
      core.setup_tooltip();
      return core.setup_chat();
    },
    setup_datetime: function() {

      /*
      datetime
       */
      return $('.datetime').each(function() {
        var date;
        try {
          date = new Date($(this).attr('datetime'));
          return $(this).html(date.toFormat($(this).attr('format')));
        } catch (_error) {}
      });
    },
    setup_focus: function() {

      /*
      focus
       */
      return $('.focus').select();
    },
    setup_tooltip: function() {

      /*
      tool tip
       */
      return $('[rel="tooltip"]').tooltip();
    },
    setup_chat: function() {

      /*
      setup_chat
       */
      var chat_token;
      if ($('#chat').length > 0) {
        chat_token = window.sessionStorage['chat_token'];
        return $.ajax({
          type: 'post',
          url: '/chat/setup',
          dataType: 'json',
          cache: false,
          data: {
            chat_token: chat_token
          },
          success: function(r) {
            var channel;
            window.sessionStorage['chat_token'] = r.chat_token;
            $('#chat_name').val(r.name);
            channel = new goog.appengine.Channel(r.channel_token);
            core.socket = channel.open();
            core.socket.onmessage = core.chat_on_message;
            return core.socket.onerror = core.chat_on_error;
          }
        });
      } else if (core.socket) {
        return core.socket.close();
      }
    },
    chat_on_message: function(msg) {
      msg = JSON.parse(msg.data);
      if (msg.rename) {
        $('#chat_board').append(msg.rename.old_name + ' rename to ' + msg.rename.new_name + '\n');
        $('#chat_name').val(msg.rename.new_name);
      }
      if (msg.message) {
        $('#chat_board').append(msg.name + ': ' + msg.message + '\n');
      }
      return $('#chat_board').animate({
        scrollTop: $('#chat_board').prop('scrollHeight')
      }, 500, 'easeOutExpo');
    },
    chat_on_error: function() {
      window.sessionStorage.removeItem('chat_token');
      return this.setup_chat();
    }
  };

  window.core = core;

  user_agent = navigator.userAgent.toLowerCase();

  core.is_safari = user_agent.indexOf('safari') !== -1 && user_agent.indexOf('chrome') === -1;

  core.is_ie = user_agent.indexOf('msie') !== -1;

}).call(this);

(function() {
  var ViewEventChat, ViewEvents, ViewEventsPost;

  ViewEventsPost = (function() {

    /*
    event of views /posts
     */
    function ViewEventsPost() {
      this.delete_post();
    }

    ViewEventsPost.prototype.delete_post = function() {

      /*
      delete the post
      :param url: $(@).attr('href')
       */
      return $(document).on('click', 'a.delete_post', function() {
        $.ajax({
          type: 'delete',
          url: $(this).attr('href'),
          dataType: 'json',
          cache: false,
          beforeSend: function() {
            return core.loading_on();
          },
          error: function() {
            core.loading_off();
            return core.error_message();
          },
          success: function(r) {
            core.loading_off();
            if (r.success) {
              return core.ajax({
                href: location.href
              }, false);
            } else {
              return $.av.pop({
                title: 'Error',
                message: 'You could not delete this post.',
                template: 'error'
              });
            }
          }
        });
        return false;
      });
    };

    return ViewEventsPost;

  })();

  ViewEventChat = (function() {

    /*
    event of views /chat
     */
    function ViewEventChat() {
      this.send_msg();
      this.chat_board_readonly();
    }

    ViewEventChat.prototype.send_msg = function() {
      return $(document).on('submit', 'form#form_chat_input', function() {
        var chat_token;
        chat_token = window.sessionStorage['chat_token'];
        $.ajax({
          type: 'post',
          url: $(this).attr('action'),
          dataType: 'json',
          cache: false,
          data: {
            token: chat_token,
            msg: $('#chat_msg').val(),
            name: $('#chat_name').val()
          },
          success: function(r) {
            if (r.success) {
              return $('#chat_msg').val('');
            }
          }
        });
        return false;
      });
    };

    ViewEventChat.prototype.chat_board_readonly = function() {
      return $(document).on('keypress', '#chat_board', function() {
        return false;
      });
    };

    return ViewEventChat;

  })();

  ViewEvents = (function() {
    function ViewEvents() {
      new ViewEventsPost();
      new ViewEventChat();
    }

    return ViewEvents;

  })();

  $(function() {
    core.setup();
    new ViewEvents();
    return core.after_page_loaded();
  });

}).call(this);
