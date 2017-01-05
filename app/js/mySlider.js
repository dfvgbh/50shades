/*global
console, $
*/

;(function(){
  'use strict';

  var currentIndex = 0;
  var prevIndex = -1;
  var items = $('.my-slider div');
  var itemsCount = items.length;
  var slideTimeout = 6000;
  var defFadeTime = 1500;

  function cycleItems(fadeTime) {
    var item = items.eq(currentIndex);
    // negative values are supported
    var prev = items.eq(prevIndex); 
    prev.fadeOut(fadeTime);
    item.fadeIn(fadeTime);
  }

  function autoSlide() {
    setInterval(function() {
      nextSlide();
    }, slideTimeout);
  }

  function init() {
    items.first().css('display', 'block');
    autoSlide(defFadeTime);
  }

  function nextSlide() {
    prevIndex = currentIndex++;
    if (currentIndex > itemsCount - 1) {
      currentIndex = 0;
    }
    cycleItems(defFadeTime);
  }

  function prevSlide() {
    prevIndex = currentIndex--;
    if (currentIndex < 0) {
      currentIndex = itemsCount - 1;
    }
    cycleItems();
  }

  init();
})();