/*global
console, $
*/

;(function(){
  'use strict';

  var currentIndex = 0,
      prevIndex = -1,
      items = $('.my-slider .slide'),
      itemsCount = items.length,
      slideTimeout = 6000,
      defFadeTime = 1500,
      fastFadeTime = 400;

  function cycleItems(fadeTime) {
    var item = items.eq(currentIndex);
    // negative values are supported
    var prev = items.eq(prevIndex); 
    prev.fadeOut(fadeTime);
    item.fadeIn(fadeTime);
  }

  function autoSlide() {
    setInterval(function() {
      nextSlide(defFadeTime);
    }, slideTimeout);
  }

  function init() {
    items.first().css('display', 'block');
    $('.controll-prev').on('click', function() {
      prevSlide(fastFadeTime);
    });
    $('.controll-next').on('click', function() {
      nextSlide(fastFadeTime);
    });
    autoSlide(defFadeTime);
  }

  function nextSlide(fadeTime) {
    prevIndex = currentIndex++;
    if (currentIndex > itemsCount - 1) {
      currentIndex = 0;
    }
    cycleItems(fadeTime);
  }

  function prevSlide(fadeTime) {
    prevIndex = currentIndex--;
    if (currentIndex < 0) {
      currentIndex = itemsCount - 1;
    }
    cycleItems(fadeTime);
  }

  init();
})();