/*global
console, $
*/

;(function() {
  'use strict';

    /* * * * * * * * * * * * * * * * *
   * Managing
   * image gallery
   * * * * * * * * * * * * * * * * */

  var gallery        = $('#gallery'),
      notFoundUrl    = 'http://ci.memecdn.com/1850732.jpg',
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
        order: 'DESC'
      },
      options        = defaultOptions;


  /**
   * Makes url, calls Router.navigate.
   */
  function navigate() {
    var url = '/page' + options.page;

    Router.navigate(url);
  }

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
   * @id - Object's id that will be updated.
   * GET http request for getting current image's rate.
   * PATCH http request for updating image's rate state on the server.
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
  function updateLastPageNumber() {
    return $.ajax({
      method: 'GET',
      dataType: 'json',
      url: root + '?_page=0_limit=1'
    })
    .done(function(data, status, xhr) {
      options.lastPage = Math.floor((xhr.
        getResponseHeader('X-Total-Count') - 1) / 10 + 1);
    })
    .fail(function() {
    });
  }

  /**
   * Renders about page.
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
    .add(/about\/$/, function() {
        console.log('about');
    })
    .add(/products\/(.*)\/edit\/(.*)/, function() {
        console.log('products', arguments);
    })
    .add(/page(\d+)/, function() {
      var sort = getURLParameter('_sort');
      var order = getURLParameter('_order');
      if (sort) {
        options.sort = sort;
      }
      if (order && order === 'DESC' || order === 'ASC') {
        options.order = order;
      }
      options.page = parseInt(arguments[0]);
      renderGallery();
    })
    .add(/upload/, function() {
      renderUpload();
    })
    .add(function() {
      options.sort = defaultOptions.sort;
      options.order = defaultOptions.order;
      Router.navigate('page1');
    })
    .listen();

    Router.check(); // check current URL

    // init paginate
    updateLastPageNumber()
    .done(function() {
      Pagination.init(document.getElementById('pagination'), {
          size: options.lastPage,
          page: options.page,
          step: 2,
          callback: function(page) {
            Router.navigate('/page' + page);
          }
      });
    });


  };


  $(function() {
    init();
  });
})();