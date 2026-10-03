/* ОСК ГРУПП — поведение главной страницы */
(function () {
  'use strict';

  /* ----- Мобильное меню ----- */
  var menu = document.getElementById('mobileMenu');
  var body = document.body;
  var menuToggle = document.querySelector('[data-menu-toggle]');

  function openMenu() {
    if (!menu) return;
    closeSearch();
    menu.classList.add('is_open');
    menu.setAttribute('aria-hidden', 'false');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'true');
    body.style.overflow = 'hidden';
  }
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove('is_open');
    menu.setAttribute('aria-hidden', 'true');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
    body.style.overflow = '';
  }

  document.querySelectorAll('[data-menu-toggle]').forEach(function (el) {
    el.addEventListener('click', function () {
      if (menu && menu.classList.contains('is_open')) closeMenu();
      else openMenu();
    });
  });
  document.querySelectorAll('[data-menu-open]').forEach(function (el) {
    el.addEventListener('click', openMenu);
  });
  document.querySelectorAll('[data-menu-close]').forEach(function (el) {
    el.addEventListener('click', closeMenu);
  });

  /* ----- Всплывающее окно поиска (мобильный) ----- */
  var searchDrop = document.getElementById('searchDrop');
  var searchToggle = document.querySelector('[data-search-toggle]');
  var searchOpenScrollY = 0;

  function closeSearch() {
    if (!searchDrop) return;
    searchDrop.classList.remove('is_open');
    searchDrop.setAttribute('aria-hidden', 'true');
    if (searchToggle) searchToggle.setAttribute('aria-expanded', 'false');
  }
  if (searchToggle) {
    searchToggle.addEventListener('click', function () {
      if (!searchDrop) return;
      var open = searchDrop.classList.toggle('is_open');
      searchDrop.setAttribute('aria-hidden', open ? 'false' : 'true');
      searchToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        searchOpenScrollY = window.scrollY;
        var inp = searchDrop.querySelector('input');
        if (inp) inp.focus();
      }
    });
  }
  // закрытие по ссылке внутри меню
  document.querySelectorAll('.mobile_nav a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });
  // Esc
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  /* ----- Избранное (визуальный тоггл для прототипа) ----- */
  document.querySelectorAll('.product_fav').forEach(function (btn) {
    btn.addEventListener('click', function () {
      btn.classList.toggle('is_active');
    });
  });

  /* ----- Тень шапки при скролле ----- */
  var header = document.querySelector('.site_header');
  function onScroll() {
    if (searchDrop && searchDrop.classList.contains('is_open') &&
        Math.abs(window.scrollY - searchOpenScrollY) > 6) {
      closeSearch();
    }
    if (!header) return;
    if (window.scrollY > 8) {
      header.style.boxShadow = '0 6px 24px -14px rgba(20,20,20,.25)';
    } else {
      header.style.boxShadow = 'none';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ----- Баннер-слайдер ----- */
  var slider = document.querySelector('[data-slider]');
  if (slider) {
    var slides = slider.querySelectorAll('.hero_slide');
    var dots = slider.querySelectorAll('.hero_dot');
    var prev = slider.querySelector('.hero_prev');
    var next = slider.querySelector('.hero_next');
    var total = slides.length;
    var cur = 0;
    var timer = null;

    function go(n) {
      cur = (n + total) % total;
      slides.forEach(function (s, idx) {
        s.classList.toggle('is_active', idx === cur);
      });
      dots.forEach(function (d, idx) {
        d.classList.toggle('is_active', idx === cur);
      });
    }
    function play() {
      stop();
      timer = setInterval(function () { go(cur + 1); }, 6000);
    }
    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
    }

    if (next) next.addEventListener('click', function () { go(cur + 1); play(); });
    if (prev) prev.addEventListener('click', function () { go(cur - 1); play(); });
    dots.forEach(function (d, idx) {
      d.addEventListener('click', function () { go(idx); play(); });
    });

    // свайп на тач-устройствах
    var x0 = null;
    slider.addEventListener('touchstart', function (e) {
      x0 = e.touches[0].clientX;
    }, { passive: true });
    slider.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) { go(dx < 0 ? cur + 1 : cur - 1); play(); }
      x0 = null;
    }, { passive: true });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', play);

    if (total > 1) play();
  }

  /* ----- Слайдеры карточек (бренды / хиты / новинки): скролл + стрелки ----- */
  document.querySelectorAll('[data-cardslider]').forEach(function (root) {
    var track = root.querySelector('.slider_track');
    var prev = root.querySelector('.slider_arrow.is_prev');
    var next = root.querySelector('.slider_arrow.is_next');
    if (!track) return;

    // шаг прокрутки = целое число карточек, помещающихся в видимую область,
    // чтобы граница последней карточки совпадала с правым краем слайдера
    function pageAmount() {
      var cards = track.children;
      if (!cards.length) return track.clientWidth;
      var first = cards[0];
      var cardW = first.offsetWidth;
      var stride = cards.length > 1 ? cards[1].offsetLeft - first.offsetLeft : cardW;
      var gap = stride - cardW;
      var visible = Math.max(1, Math.floor((track.clientWidth + gap) / stride));
      return visible * stride;
    }

    function step(dir) {
      var max = track.scrollWidth - track.clientWidth;
      var amt = pageAmount();
      var target, wrap = false;
      if (dir > 0) {
        if (track.scrollLeft >= max - 2) { target = 0; wrap = true; }
        else target = track.scrollLeft + amt;
      } else {
        if (track.scrollLeft <= 2) { target = max; wrap = true; }
        else target = track.scrollLeft - amt;
      }
      track.scrollTo({ left: target, behavior: wrap ? 'auto' : 'smooth' });
    }

    var ap = parseInt(root.getAttribute('data-autoplay'), 10);
    var timer = null;
    function play() { if (ap > 0) { stop(); timer = setInterval(function () { step(1); }, ap); } }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    if (next) next.addEventListener('click', function () { step(1); play(); });
    if (prev) prev.addEventListener('click', function () { step(-1); play(); });
    if (ap > 0) {
      root.addEventListener('mouseenter', stop);
      root.addEventListener('mouseleave', play);
      play();
    }
  });

})();
