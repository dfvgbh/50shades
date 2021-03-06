/*global
console, $, Modernizr
*/

;(function() {
  'use strict';

  function ready() {
    // document.scroll not supported in IE8, using window.scroll instead
    $(window).scroll(function() {
      $('.nav-wrapper').toggleClass('nav-wrapper-transparent', $(this).scrollTop() < 150);
    });

    // rewrite links in html for browsers without history API
    if (!Modernizr.history) {
      $('#top-navbar a').each(function(index, e) {
        var href = $(e).attr('href');
        $(e).attr('href', href.replace(/\//, '#'));
      }); 
    }

    // create map
    var map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 50.448882, lng: 30.457254},
            zoom: 15
    });
  }

  $(function() {
    ready();
  });
})();
