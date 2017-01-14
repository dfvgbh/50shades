/*global
console, $
*/

;(function() {
  'use strict';

  var gallery     = $('#gallery'),
      itemsLimit  = 10,
      notFoundUrl = 'http://ci.memecdn.com/1850732.jpg',
      itemHtml    = '<div class="photo-container"><a href="/"class="photo-item"></a></div>',
      root        = 'http://localhost:3000/images';

  /**
   * Sends request to get an array of images refered to the @page. Return Promise.
   */
  function getPage(page, limit) {
    limit = typeof limit !== 'undefined' ?  limit : itemsLimit;

    return $.ajax({
      method: 'GET',
      dataType: 'json',
      url: root + '?_page=' + page + '&_limit=' + limit,
      // TODO
      beforeSend:function(){
        gallery.html('<div class="loading"><img src="../images/loading.gif" alt="Loading..." /></div>');
      }
    });
  }

  /**
   * Injecting and image that represented by JSON object @data into gallery.
   */
  function injectItem(data) {
    data.url = data.url || notFoundUrl;
    $(itemHtml).css('background-image', 'url(' + data.url + ')').appendTo(gallery);
  }

  /**
   * Managing page loading.
   */
  function proceedData() {
    // TODO
    for (var i = 1; i < 4; i++) {
      getPage(i)
      .done(function(data) {
        $('.loading').remove();
        if ($.isArray(data)) {
          for (var j = 0; j < data.length; j++) {
            injectItem(data[j]);
          }
        } else {
          injectItem(data);
        }
      })
      .fail(function() {
      });
    }
  }

  $(function() {
    proceedData();
  });
})();
