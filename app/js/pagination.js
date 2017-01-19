;(function(window) {
  'use strict';

  var Pagination = {

    html: '',

    // converting initialize data
    extend: function(data) {
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
    add: function(s, f) {
      for (var i = s; i < f; i++) {
        Pagination.html += '<a>' + i + '</a>';
      }
    },

    // add last page with separator
    last: function() {
      Pagination.html += '<i>...</i><a>' + Pagination.size + '</a>';
    },

    // add first page with separator
    first: function() {
      Pagination.html += '<a>1</a><i>...</i>';
    },


    // --------------------
    // Handlers
    // --------------------

    // change page
    click: function(e) {
      
      Pagination.page = +this.innerHTML;
      Pagination.start();
    },

    // previous page
    prev: function() {
      Pagination.page--;
      if (Pagination.page < 1) {
        Pagination.page = 1;
      }
      Pagination.start();
    },

    // next page
    next: function() {
      Pagination.page++;
      if (Pagination.page > Pagination.size) {
        Pagination.page = Pagination.size;
      }
      Pagination.start();
    },


    // --------------------
    // Script
    // --------------------

    // binding pages
    bind: function() {
      var a = Pagination.e.getElementsByTagName('a');
      for (var i = 0; i < a.length; i++) {
        if (+a[i].innerHTML === Pagination.page) a[i].className = 'current';
        if (Modernizr.eventlistener) {
          a[i].addEventListener('click', Pagination.click, false);
        } else {
          a[i].attachEvent('onclick', Pagination.click);
        }
      }
    },

    // write pagination
    finish: function() {
      Pagination.e.innerHTML = Pagination.html;
      Pagination.html = '';
      Pagination.bind();
    },

    // find pagination type
    start: function() {
      Pagination.callback(Pagination.page);

      if (Pagination.size < Pagination.step * 2 + 6) {
        Pagination.add(1, Pagination.size + 1);
      }
      else if (Pagination.page < Pagination.step * 2 + 1) {
        Pagination.add(1, Pagination.step * 2 + 4);
        Pagination.last();
      }
      else if (Pagination.page > Pagination.size - Pagination.step * 2) {
        Pagination.first();
        Pagination.add(Pagination.size - Pagination.step * 2 - 2, Pagination.size + 1);
      }
      else {
        Pagination.first();
        Pagination.add(Pagination.page - Pagination.step, Pagination.page + Pagination.step + 1);
        Pagination.last();
      }
      Pagination.finish();
    },


    // --------------------
    // initialization
    // --------------------

    // binding buttons
    buttons: function(e) {
      var nav = e.getElementsByTagName('a');
      if (Modernizr.eventlistener) {
        nav[0].addEventListener('click', Pagination.prev, false);
        nav[1].addEventListener('click', Pagination.next, false);
      } else {
        nav[0].attachEvent('onclick', Pagination.prev);
        nav[1].attachEvent('onclick', Pagination.next);
      }

    },

    // create skeleton
    create: function(e) {
      var html = [
        '<a><svg class="controll-prev"><use xlink:href="#angle-left" /></svg></a>', // previous button
        '<span></span>',  // pagination container
        '<a><svg class="controll-next"><use xlink:href="#angle-right" /></svg></a>'  // next button
      ];

      e.innerHTML = html.join('');
      Pagination.e = e.getElementsByTagName('span')[0];
      Pagination.buttons(e);
    },

    // init
    init: function(e, data) {
      Pagination.extend(data);
      Pagination.create(e);
      Pagination.start();
    }
  };

  window.Pagination = Pagination;
  
})(window);