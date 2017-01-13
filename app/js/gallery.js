/*global
console, $
*/

;(function() {
  'use strict';

  var gallery = $('#gallery');
  var root = 'http://localhost:3000';

  function get(id) {
    return $.ajax({
      dataType: "json",
      url: root + '/images/' + id,
      method: 'GET'
    }).done(function(data) {
      addPhoto(data);
    });
  }

  function addPhoto(data) {
    $('<div class="photo-container"><a href="/"class="photo-item"></a></div>').css('background-image', 'url(' + data.url + ')').appendTo(gallery);
  }

  $(function() {
    var o = null;
    for (var i = 0; i < 20; i++) {
      get(i);
    }
  });
})();
