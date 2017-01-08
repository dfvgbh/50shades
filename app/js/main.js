/*global
console, $
*/

;(function() {
  'use strict';

  function ready() {
    // document.scroll not supported in IE8
    $(window).scroll(function() {
      $('.nav-wrapper').toggleClass('nav-wrapper-transparent', $(this).scrollTop() < 150);
    });
  }

  $(function() {
    ready();
  });
})();
