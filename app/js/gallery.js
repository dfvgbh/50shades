/*global
console, $
*/

;(function() {
  'use strict';

    /* * * * * * * * * * * * * * * * *
   * Managing
   * image gallery
   * * * * * * * * * * * * * * * * */

  var gallery     = $('#gallery'),
      itemsLimit  = 10,
      lastPage     = 0,
      notFoundUrl = 'http://ci.memecdn.com/1850732.jpg',
      itemHtml    = '<div class="photo-container"><a href="/"class="photo-item"></a></div>',
      root        = 'http://localhost:3000/images';

  /**
   * Sends request to get an array of images refered to the @page. 
   * Updating gallery with requested iamges.
   * @return {Deffered} - JQuery deffered object.
   */
  function updateGallery(page) {

    return $.ajax({
      method: 'GET',
      dataType: 'json',
      url: root + '?_page=' + page + '&_limit=' + itemsLimit,
      beforeSend:function(){
        gallery.empty();
        gallery.append('<div class="loading"><img src="./images/loading.gif" alt="Loading..." /></div>');
      }
    })
    .done(function(data, status, xhr) {      
      gallery.find('.loading').remove();
      if ($.isArray(data)) {
        for (var j = 0; j < data.length; j++) {
          injectItem(data[j]);
        }
      } else {
        injectItem(data);
      }
    })
    .fail(function() {
      gallery.html('Sorry, can\'t found');
    });
  }

  /**
   * Updating last page number. Sending ajax request for getting header,
   * which contains total count of records in base.
   * @return {Deffered} - JQuery deffered object.
   */
  function updateLastPageNumber() {
    return $.ajax({
      method: 'GET',
      dataType: 'json',
      url: root + '?_page=0_limit=1'
    })
    .done(function(data, status, xhr) {
      lastPage = Math.floor((xhr.
        getResponseHeader('X-Total-Count') - 1) / itemsLimit + 1);
    })
    .fail(function() {
    });
  }

  /**
   * Injecting and image that represented by JSON object @data into gallery.
   */
  function injectItem(data) {
    data.url = data.url || notFoundUrl;
    $(itemHtml).css('background-image', 'url(' + data.url + ')').appendTo(gallery);
  }


  /* * * * * * * * * * * * * * * * *
   * Pagination
   * javascript page navigation
   * * * * * * * * * * * * * * * * */

  var Pagination = {

    html: '',

    // converting initialize data
    Extend: function(data) {
      data = data || {};
      Pagination.size = data.size || 300;
      Pagination.page = data.page || 1;
      Pagination.step = data.step || 3;
      Pagination.callback = function() {
        if (typeof(data.callback) === typeof(Function)) {
          var args = Array.prototype.slice.call(arguments);
          data.callback(args);
        }
      };
    },

    // add pages by number (from [s] to [f])
    Add: function(s, f) {
      for (var i = s; i < f; i++) {
          Pagination.html += '<a>' + i + '</a>';
      }
    },

    // add last page with separator
    Last: function() {
      Pagination.html += '<i>...</i><a>' + Pagination.size + '</a>';
    },

    // add first page with separator
    First: function() {
      Pagination.html += '<a>1</a><i>...</i>';
    },

    // --------------------
    // Handlers
    // --------------------

    // change page
    Click: function(e) {
      
      Pagination.page = +this.innerHTML;
      Pagination.Start();
    },

    // previous page
    Prev: function() {
      Pagination.page--;
      if (Pagination.page < 1) {
          Pagination.page = 1;
      }
      Pagination.Start();
    },

    // next page
    Next: function() {
      Pagination.page++;
      if (Pagination.page > Pagination.size) {
          Pagination.page = Pagination.size;
      }
      Pagination.Start();
    },



    // --------------------
    // Script
    // --------------------

    // binding pages
    Bind: function() {
      var a = Pagination.e.getElementsByTagName('a');
      for (var i = 0; i < a.length; i++) {
          if (+a[i].innerHTML === Pagination.page) a[i].className = 'current';
          if (Modernizr.eventlistener) {
            a[i].addEventListener('click', Pagination.Click, false);
          } else {
            a[i].attachEvent('onclick', Pagination.Click);
          }
      }
    },

    // write pagination
    Finish: function() {
      Pagination.e.innerHTML = Pagination.html;
      Pagination.html = '';
      Pagination.Bind();
    },

    // find pagination type
    Start: function() {
      Pagination.callback(Pagination.page);

      if (Pagination.size < Pagination.step * 2 + 6) {
          Pagination.Add(1, Pagination.size + 1);
      }
      else if (Pagination.page < Pagination.step * 2 + 1) {
          Pagination.Add(1, Pagination.step * 2 + 4);
          Pagination.Last();
      }
      else if (Pagination.page > Pagination.size - Pagination.step * 2) {
          Pagination.First();
          Pagination.Add(Pagination.size - Pagination.step * 2 - 2, Pagination.size + 1);
      }
      else {
          Pagination.First();
          Pagination.Add(Pagination.page - Pagination.step, Pagination.page + Pagination.step + 1);
          Pagination.Last();
      }
      Pagination.Finish();
    },



    // --------------------
    // Initialization
    // --------------------

    // binding buttons
    Buttons: function(e) {
      var nav = e.getElementsByTagName('a');
      if (Modernizr.eventlistener) {
        nav[0].addEventListener('click', Pagination.Prev, false);
        nav[1].addEventListener('click', Pagination.Next, false);
      } else {
        nav[0].attachEvent('onclick', Pagination.Prev);
        nav[1].attachEvent('onclick', Pagination.Next);
      }

    },

    // create skeleton
    Create: function(e) {
      var html = [
          '<a><svg class="controll-prev"><use xlink:href="#angle-left" /></svg></a>', // previous button
          '<span></span>',  // pagination container
          '<a><svg class="controll-next"><use xlink:href="#angle-right" /></svg></a>'  // next button
      ];

      e.innerHTML = html.join('');
      Pagination.e = e.getElementsByTagName('span')[0];
      Pagination.Buttons(e);
    },

    // init
    Init: function(e, data) {
      Pagination.Extend(data);
      Pagination.Create(e);
      Pagination.Start();
    }
  };


  /* * * * * * * * * * * * * * * * *
  * Router
  * * * * * * * * * * * * * * * * */
  var Router = {
    routes: [],
    mode: null,
    root: '/',
    config: function(options) {
      this.mode = options && options.mode && options.mode == 'history' &&
                    !!(history.pushState) ? 'history' : 'hash';
      this.root = options && options.root ? '/' + this.clearSlashes(options.root) + '/' : '/';
      return this;
    },

    getFragment: function() {
      var fragment = '';
      if(this.mode === 'history') {
        fragment = this.clearSlashes(decodeURI(location.pathname + location.search));
        fragment = fragment.replace(/\?(.*)$/, '');
        fragment = this.root != '/' ? fragment.replace(this.root, '') : fragment;
      } else {
        var match = window.location.href.match(/#(.*)$/);
        fragment = match ? match[1] : '';
      }
      return this.clearSlashes(fragment);
    },

    clearSlashes: function(path) {
      return path.toString().replace(/\/$/, '').replace(/^\//, '');
    },

    add: function(re, handler) {
      if(typeof re == 'function') {
          handler = re;
          re = '';
      }
      this.routes.push({ re: re, handler: handler});
      return this;
    },

    remove: function(param) {
      for(var i = 0, r; i < this.routes.length; i++) {
        r = this.routes[i];
        if(r.handler === param || r.re.toString() === param.toString()) {
            this.routes.splice(i, 1); 
            return this;
        }
      }
      return this;
    },

    flush: function() {
      this.routes = [];
      this.mode = null;
      this.root = '/';
      return this;
    },

    check: function(f) {
      var fragment = f || this.getFragment();
      for(var i=0; i<this.routes.length; i++) {
          var match = fragment.match(this.routes[i].re);
          if(match) {
              match.shift();
              this.routes[i].handler.apply({}, match);
              return this;
          }           
      }
      return this;
    },

    listen: function() {
      var self = this;
      var current = self.getFragment();
      var fn = function() {
          if(current !== self.getFragment()) {
              current = self.getFragment();
              self.check(current);
          }
      };
      clearInterval(this.interval);
      this.interval = setInterval(fn, 50);
      return this;
    },

    navigate: function(path) {
        path = path ? path : '';
        if(this.mode === 'history') {
            history.pushState(null, null, this.root + this.clearSlashes(path));
        } else {
            window.location.href = window.location.href.replace(/#(.*)$/, '') + '#' + path;
        }
        return this;
    }
  };

  // configuration
  Router.config({ mode: 'history'});

  // returning the user to the initial state
  Router.navigate();

  // adding routes
  Router
  .add(/about/, function() {
      console.log('about');
  })
  .add(/products\/(.*)\/edit\/(.*)/, function() {
      console.log('products', arguments);
  })
  .add(function() {
      console.log('default');
  })
  .listen();

  // forwarding


  /* * * * * * * * * * * * * * * * *
  * Initialization
  * * * * * * * * * * * * * * * * */

  var init = function() {
    updateLastPageNumber()
    .done(function() {
      Pagination.Init(document.getElementById('pagination'), {
          size: lastPage,
          page: 1,
          step: 2,
          callback: updateGallery
      });
    });
  };


  $(function() {
    init();
  });
})();
