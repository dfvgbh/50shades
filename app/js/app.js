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
      root        = 'http://localhost:3000/api/images';

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
  * Initialization
  * * * * * * * * * * * * * * * * */
  var init = function() {
    updateLastPageNumber()
    .done(function() {
      Pagination.init(document.getElementById('pagination'), {
          size: lastPage,
          page: 1,
          step: 2,
          callback: updateGallery
      });
    });

    // configuration
    Router.config({ mode: 'history'});

    Router
    .add(/about\/$/, function() {
        console.log('about');
    })    
    .add(/about\/sec/, function() {
        console.log('about / sec');
    })
    .add(/products\/(.*)\/edit\/(.*)/, function() {
        console.log('products', arguments);
    })
    .add(function() {
        console.log('default');
    })
    .listen();


    Router.check();

    // forwarding
  };


  $(function() {
    init();
  });
})();
