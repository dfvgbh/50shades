/*global
console, $
*/

;(function() {
  'use strict';

    /* * * * * * * * * * * * * * * * *
   * Managing
   * image gallery
   * * * * * * * * * * * * * * * * */

  var gallery       = $('#gallery'),
      notFoundUrl   = 'http://ci.memecdn.com/1850732.jpg',
      itemHtml      = '<div class="photo-container"><a href="/"class="photo-item"></a></div>',
      root          = 'http://localhost:3000/api/images',
      options       = {
        page: 1,
        lastPage: 0,
        itemsPerPage: 10,
        sort: '',
        order: 'ASC'
      };


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
   * Injecting and image that represented by JSON object @data into gallery.
   */
  function injectItem(data) {
    data.url = data.url || notFoundUrl;
    $(itemHtml).css('background-image', 'url(' + data.url + ')').appendTo(gallery);
  }

  function GetURLParameter(sParam) {
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
      var sort = GetURLParameter('_sort');
      var order = GetURLParameter('_order');
      if (sort) {
        options.sort = sort;
      }
      if (order && order === 'DESC' || order === 'ASC') {
        options.order = order;
      }
      options.page = parseInt(arguments[0]);
      renderGallery();
    })
    .add(function() {
      Router.navigate('page1');
    })
    .listen();

    Router.check();

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
