(function() {
  'use strict';
  const myVar = setInterval(setColor, 1000);

  function setColor() {
    console.log('3sec');
    const isMobileVersion = document.getElementsByClassName('grid-cell-rect');
    if (isMobileVersion.length > 0) {
      stopColor();
    }
  }

  $('body').
      append(`'<p class='cir nuwo'></p>'`).
      append(`'<p class='cir opr'></p>'`).
      append(`'<p class='cir oac'></p>'`).
      append(`'<p class='cir ohl'></p>'`).
      append(`'<p class='cir done'></p>'`).
      append(`'<p class='rest1'></p>'`);

  $('.cir.done').addClass('hihi');
  $('.cir.opr').addClass('hihi');

  $('.cir').on('click', function(event) {
    $(this).toggleClass('hihi');
    if ($(event.target).hasClass('done')) $(
        '.profile-table tbody:has(span[title="Background Check"])').toggle();
    if ($(event.target).hasClass('opr')) $(
        '.profile-table tbody:has(span[title="Offer Preparation"])').toggle();
    if ($(event.target).hasClass('oac')) $(
        '.profile-table tbody:has(span[title="Offer Acceptance"])').toggle();
    if ($(event.target).hasClass('ohl')) $(
        '.profile-table tbody:has(span[title="On Hold"])').toggle();

  });

  function calculate() {
    $('p.done').
        html($('span[title="Background Check"]').length).
        prop('title', 'Background Check');
    $('p.ohl').
        html($('span[title="On Hold"]').length).
        prop('title', 'On Hold"');
    $('p.oac').
        html($('span[title="Offer Acceptance"]').length).
        prop('title', 'Offer Acceptance');
    $('p.opr').
        html($('span[title="Offer Preparation"]').length).
        prop('title', 'Offer Preparation');
    $('p.nuwo').
        html($('span[title="Backup Consideration"]').length +
            $('span[title="Select Action"]').length).
        prop('title', 'New');
  }

  function countr() {
    $('.profile-table tbody:has(span[title="Backup Consideration"])').
        addClass('nw');
    $('.profile-table tbody:has(span[title="Select Action"])').addClass('nw');
    $('.profile-table tbody:has(span[title="On Hold"])').addClass('oh');
    $('.profile-table tbody:has(span[title="Offer Preparation"])').
        addClass('op');
    $('.profile-table tbody:has(span[title="Offer Acceptance"])').
        addClass('oa');
    $('.profile-table tbody:has(span[title="Background Check"])').
        addClass('bch');
  }

  function stopColor() {
    clearInterval(myVar);
    $('.profile-table tbody:has(span[title="Background Check"])').hide();
    $('.profile-table tbody:has(span[title="Offer Preparation"])').hide();
    countr();
    calculate();
  }

  document.addEventListener('scroll', function(event) {
    countr();
    calculate();
  }, true);

  $('.rest1').on('click', function() {
    stopColor();
  });

})();