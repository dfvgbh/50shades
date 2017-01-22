/*global
console, $
*/

;(function() {
  'use strict';

  var gallery        = $('.gallery'),
      notFoundUrl    = './images/notFound.png',
      itemHtml       = '<div class="photo-container">' + 
                         '<a href="/" class="mask">' +
                           '<div class="wrapper">' +
                             '<span class="tags"></span>' +
                             '<span class="date"></span>' +
                             '<span class="author"></span>' +
                             '<span class="rate"></span>' +
                             '<div class="icon-heart-o">' +
                               '<svg><use xlink:href="#heart-o"/></svg>' +
                             '</div>' +
                           '</div>' +
                         '</a>' +
                       '</div>',
      root           = 'http://localhost:3000/api/images',
      defaultOptions = {
        page: 1,
        lastPage: 0,
        itemsPerPage: 10,
        sort: 'date',
        order: 'DESC',
        search: ''
      },
      options        = defaultOptions;


  /**
   * Sends request to get an array of images refered to the @page. 
   * Updating gallery with requested iamges.
   * @return {Deffered} - JQuery deffered object.
   */
  function renderGallery() {
    $('.visible').each(function(index, e) {
      $(e).removeClass('visible');
    });
    $('#gallery-section').addClass('visible');

    var url = root + '?_page=' + options.page + '&_limit=' + options.itemsPerPage;
    if (options.sort) {
      url += '&_sort=' + options.sort;
    }
    if (options.order === 'DESC') {
      url += '&_order=DESC';
    }
    if (options.search) {
      url += '&tags_like=' + options.search;
    }

    var title = $('#gallery-section h3');
    if (options.search) {
      title.text('Search results:');
    } else if (options.sort == 'rate') {
      title.text('Most popular photos:');
    } else if (options.sort == 'date') {
      title.text('Recently added photos:');
    }

    return $.ajax({
      method: 'GET',
      dataType: 'json',
      url: url,
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
   * Injecting item with image inside that represented by JSON object @data into gallery.
   */
  function injectItem(data) {
    data.url = data.url || notFoundUrl;
    var e = $(itemHtml).clone();
    e.find('.mask').attr('href', data.url);
    e.find('.author').text('by ' + data.usr);
    e.find('.date').text(new Date(data.date).toLocaleDateString());
    e.find('.tags').text(data.tags.toString().replace(/\,/g, ', '));
    e.find('.rate').text(data.rate.replace(/^0*/, ''));

    e.find('.icon-heart-o').hover(function() {            // hover in
      $(this).find('use').attr('xlink:href', '#heart');
    },
    function() {                                          // hover out
      $(this).find('use').attr('xlink:href', '#heart-o');
    }).on('click', function(event) {                      // on click on heart
      var that = $(this);
      event.preventDefault();
      doLike(data.id)
      .done(function() {
        that.off('mouseenter');
        that.off('mouseleave');
        that.off('click');
        that.on('click', function(event) {
          event.preventDefault();
        });
        that.find('use').attr('xlink:href', '#heart');
        var rateNode = that.parent().find('.rate').first();
        rateNode.text(+rateNode.text() + 1);
      })
      .fail(function() {
        $('main').prepend('You can\'t like now. Try again later');
      });
    
    });

    e.css('background-image', 'url(' + data.url + ')').appendTo(gallery);
  }

  /**
   * GET http request for getting current image's rate.
   * PATCH http request for updating image's rate state on the server.
   * @param {number} id - Object's id that will be updated.
   * @return {Deffered} - JQuery deffered object.
   */
  function doLike(id) {
    return $.ajax({
      method: 'GET',
      dataType: 'json',
      url: root + '/' + id,
      timeout: 3000
    })
    .done(function(data, status, xhr) {    
      var rate = +data.rate + 1;
      // pad left with zeroes for 3-length number
      var pad = new Array(4).join('0');
      rate = (pad + rate).slice(-pad.length);

      $.ajax({
        method: 'PATCH',
        dataType: 'json',
        data: 'rate=' + rate,
        url: root + '/' + id,
        timeout: 3000
      })
      .fail(function() {
        $('main').prepend('You can\'t like now. Try again later');
      });
    });
  }

  /**
   * Updating last page number. Sending ajax request for getting header,
   * which contains total count of records in base.
   * @return {Deffered} - JQuery deffered object.
   */
  function updatePagination() {
    var lastPage = 0;
    var url = root + '?_page=0_limit=1';

    if (options.search) {
      url += '&tags_like=' + options.search;
    }

    return $.ajax({
      method: 'GET',
      dataType: 'json',
      url: url
    })
    .done(function(data, status, xhr) {
      lastPage = Math.floor((xhr.
        getResponseHeader('X-Total-Count') - 1) / 10 + 1);
    })
    .done(function() {
      if (lastPage === 0) {
        $('#gallery-section').append('No results');
        return;
      }
      if (lastPage == options.lastPage) {
        return;
      }
      options.lastPage = lastPage;
      Pagination.init(document.getElementById('pagination'), {
          size: options.lastPage,
          page: options.page,
          step: 2,
          callback: function(page) {
            if (options.search) {
              Router.navigate('search/page' + page);
            } else {
              Router.navigate('page' + page);
            }
          }
      });
    })
    .fail(function() {
    });
  }

  /**
   * Renders upload page.
   */
  function renderUpload() {
    $('.visible').each(function(index, e) {
      $(e).removeClass('visible');
    });
    $('#upload-section').addClass('visible');

    $('#upload-form').on('submit', function(event) {
      event.preventDefault();
      var that = this;
      $.ajax({
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        url: root,
        data: JSON.stringify({
              'url': that.url.value,
              'usr': that.name.value,
              'date': new Date(),
              'rate': "000",
              'tags': that.tags.value.split(', ')
        })
      })
      .done(function() {
        Router.navigate('/');
      })
      .fail(function() {
        $('#upload-form').append('When something is going wrong, you see it');
      });

    });
  }

  /**
   * Renders about page.
   */
  function renderAbout() {
    $('.visible').each(function(index, e) {
      $(e).removeClass('visible');
    });
    $('#aboutus-section').addClass('visible');
  }

  /**
   * Renders contacts page.
   */
  function renderContacts() {
    $('.visible').each(function(index, e) {
      $(e).removeClass('visible');
    });
    $('#contacts-section').addClass('visible');
  }

  /**
   * Parse URL param.
   * @param {string} sParam - Param that will be returned.
   * @return - value of @sParam.
   */
  function getURLParameter(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');

    for (var i = 0; i < sURLVariables.length; i++) {
      var sParameterName = sURLVariables[i].split('=');
      if (sParameterName[0] == sParam) {
         return sParameterName[1];
      }
    }
  }


  /* * * * * * * * * * * * * * * * *
  * Initialization
  * * * * * * * * * * * * * * * * */

  var init = function() {
    // configuration
    Router.config({ mode: 'history'});

    Router
    .add(/popular\/page(\d+)/, function() {
      options.sort = 'rate';
      options.order = 'DESC';
      options.search = '';
      options.page = parseInt(arguments[0]);
      renderGallery();
    })
    .add(/search\/page(\d+)/, function() {
      options.sort = 'rate';
      options.order = 'DESC';
      options.page = parseInt(arguments[0]);
      renderGallery();
    })
    .add(/page(\d+)/, function() {
      options.sort = 'date';
      options.order = 'DESC';
      options.search = '';
      options.page = parseInt(arguments[0]);
      renderGallery();
    })
    .add(/upload/, function() {
      renderUpload();
    })
    .add(/about/, function() {
      renderAbout();
    })
    .add(/contacts/, function() {
      renderContacts();
    })
    .add(function() {
      options = defaultOptions;
      Router.navigate('page1');
    })
    .listen();

    Router.check(); // check current URL

    // update/init paginate
    updatePagination();

    $('.search-button').each(function(index, e) {
      $(e).on('click', function(event) {
        event.preventDefault();
        options.search = $(this).parent().find('input').val();
        updatePagination();
        Router.navigate('search/page1');
        Router.check();
      });
    });

  };


  $(function() {
    init();
  });
})();