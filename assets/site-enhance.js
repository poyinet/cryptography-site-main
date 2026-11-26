/* 三站共享增强：JSON-LD、反馈入口、页面事件、可访问性小修。 */
(function () {
  if (window.__siteEnhanceLoaded) return;
  window.__siteEnhanceLoaded = true;
  var root = document.documentElement;
  var SITE = root.getAttribute('data-site') || '';
  var EN = (root.lang || '').toLowerCase().indexOf('en') === 0;
  var PATH = location.pathname.replace(/index\.html$/, '');
  var BUFFER_KEY = 'crypto-events-v1';

  function pageType() {
    if (/^\/(en\/)?progress\//.test(PATH)) return 'progress';
    if (/\/(courses)\//.test(PATH)) return 'course';
    if (/\/(lessons)\//.test(PATH)) return 'lesson';
    if (/\/game\//.test(PATH)) return 'game';
    if (/\/games\//.test(PATH)) return 'raw-game';
    if (/\/entries\//.test(PATH) || /\/read\//.test(PATH)) return 'article';
    if (/404\.html$/.test(PATH)) return '404';
    return 'page';
  }

  function readBuffer() {
    try { return JSON.parse(localStorage.getItem(BUFFER_KEY) || '[]') || []; } catch (e) { return []; }
  }
  function writeBuffer(list) {
    try { localStorage.setItem(BUFFER_KEY, JSON.stringify(list.slice(-60))); } catch (e) {}
  }
  function track(name, data) {
    var entry = {name: name, at: Date.now(), site: SITE, path: location.pathname, data: data || {}};
    var list = readBuffer();
    list.push(entry);
    writeBuffer(list);
    try {
      if (window.__cryptoEventSink) window.__cryptoEventSink(entry);
      if (window.dataLayer && typeof window.dataLayer.push === 'function') window.dataLayer.push({event: name, site: SITE, path: location.pathname});
    } catch (e) {}
  }
  window.CryptoEvents = {track: track, buffer: readBuffer};

  var pre = window.__cryptoEventsQueue;
  if (pre && pre.length) {
    pre.forEach(function (x) { if (x && x[0]) track(x[0], x[1]); });
    window.__cryptoEventsQueue = [];
  }

  function absolute(url) {
    try { return new URL(url, location.href).href; } catch (e) { return url; }
  }
  function canonical() {
    var el = document.querySelector('link[rel="canonical"]');
    return el ? el.getAttribute('href') : location.href.split('#')[0];
  }
  function description() {
    var el = document.querySelector('meta[name="description"]');
    return el ? el.getAttribute('content') || '' : '';
  }
  function h1() {
    var el = document.querySelector('h1');
    return el ? (el.textContent || '').replace(/\s+/g, ' ').trim() : '';
  }
  function breadcrumb() {
    var box = document.querySelector('.breadcrumbs');
    if (!box) return null;
    var links = Array.prototype.slice.call(box.querySelectorAll('a, span')).filter(function (x) {
      return (x.textContent || '').trim();
    });
    var items = links.map(function (x, i) {
      var name = (x.textContent || '').trim();
      var url = x.tagName === 'A' ? absolute(x.getAttribute('href')) : canonical();
      return {'@type': 'ListItem', position: i + 1, name: name, item: url};
    });
    if (!items.length) return null;
    return {'@type': 'BreadcrumbList', itemListElement: items};
  }

  function addJsonLd() {
    if (document.querySelector('script[type="application/ld+json"][data-site-seo]')) return;
    var type = pageType();
    var url = canonical();
    var name = h1() || document.title;
    var desc = description();
    var lang = EN ? 'en' : 'zh-CN';
    var org = {'@type': 'Organization', '@id': 'https://poyi.net/#org', name: EN ? 'Cryptography Atlas' : '密码学探索馆', url: 'https://poyi.net/', sameAs: ['https://github.com/poyinet/cryptography-decode-history', 'https://github.com/poyinet/cryptography-games']};
    var website = {'@type': 'WebSite', '@id': 'https://poyi.net/#website', url: 'https://poyi.net/', name: EN ? 'Cryptography Atlas' : '密码学探索馆', inLanguage: lang, publisher: {'@id': 'https://poyi.net/#org'}, potentialAction: {'@type': 'SearchAction', target: 'https://poyi.net/search/?q={search_term_string}', 'query-input': 'required name=search_term_string'}};
    var graph = [org, website];
    var main = null;

    if (type === 'course') {
      var cid = (PATH.match(/courses\/([^/]+)/) || ['', ''])[1];
      main = {'@type': 'Course', '@id': url + '#course', name: name, description: desc, url: url, inLanguage: lang, provider: {'@id': 'https://poyi.net/#org'}, educationalLevel: 'beginner to advanced', courseCode: cid};
    } else if (type === 'lesson') {
      main = {'@type': 'LearningResource', '@id': url + '#lesson', name: name, description: desc, url: url, inLanguage: lang, learningResourceType: 'Lesson', educationalLevel: 'beginner to advanced', provider: {'@id': 'https://poyi.net/#org'}};
      var side = document.querySelector('[data-lesson-course]');
      if (side && side.getAttribute('data-course')) {
        var cid2 = side.getAttribute('data-course');
        main.isPartOf = {'@type': 'Course', '@id': 'https://learn.poyi.net/' + (EN ? 'en/' : '') + 'courses/' + cid2 + '/#course', name: cid2, url: 'https://learn.poyi.net/' + (EN ? 'en/' : '') + 'courses/' + cid2 + '/'};
      }
    } else if (type === 'article') {
      main = {'@type': 'Article', '@id': url + '#article', headline: name, description: desc, url: url, inLanguage: lang, isPartOf: {'@id': 'https://poyi.net/#website'}, author: {'@id': 'https://poyi.net/#org'}, publisher: {'@id': 'https://poyi.net/#org'}};
    } else if (type === 'game' || type === 'raw-game') {
      main = {'@type': 'VideoGame', '@id': url + '#game', name: name, description: desc, url: url, inLanguage: lang, applicationCategory: 'Game', operatingSystem: 'Any', gamePlatform: 'Web browser', publisher: {'@id': 'https://poyi.net/#org'}};
    } else {
      main = {'@type': 'WebPage', '@id': url + '#webpage', name: name, description: desc, url: url, inLanguage: lang, isPartOf: {'@id': 'https://poyi.net/#website'}};
    }
    graph.push(main);
    var bc = breadcrumb();
    if (bc) graph.push(bc);
    var data = {'@context': 'https://schema.org', '@graph': graph};
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.setAttribute('data-site-seo', '1');
    s.textContent = JSON.stringify(data);
    document.head.appendChild(s);
  }

  function addFeedback() {
    if (document.querySelector('[data-site-feedback]')) return;
    var footer = document.querySelector('.footer-links');
    if (!footer) return;
    var repo = SITE === 'play' ? 'https://github.com/poyinet/cryptography-games/issues/new' : 'https://github.com/poyinet/cryptography-decode-history/issues/new';
    var a = document.createElement('a');
    a.setAttribute('data-site-feedback', '1');
    a.href = repo + '?labels=feedback&title=' + encodeURIComponent('[site] ' + (EN ? 'Feedback on ' : '站点反馈：') + location.pathname);
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = EN ? 'Feedback ↗' : '反馈 ↗';
    footer.appendChild(a);
  }

  function a11y() {
    document.querySelectorAll('iframe').forEach(function (f) {
      if (!f.getAttribute('title')) {
        f.setAttribute('title', EN ? 'Game player' : '游戏播放器');
      }
      if (!f.getAttribute('loading')) f.setAttribute('loading', 'lazy');
    });
    document.querySelectorAll('button.icon-button').forEach(function (b) {
      if (!b.getAttribute('type')) b.setAttribute('type', 'button');
    });
  }

  function keyboardSearch() {
    document.addEventListener('keydown', function (ev) {
      if (ev.key !== '/' || ev.ctrlKey || ev.metaKey || ev.altKey) return;
      var tag = (ev.target && ev.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || (ev.target && ev.target.isContentEditable)) return;
      var input = document.querySelector('input[type="search"], input[name="q"]');
      if (!input) return;
      ev.preventDefault();
      input.focus();
      input.select && input.select();
    });
  }

  function init() {
    addJsonLd();
    addFeedback();
    a11y();
    keyboardSearch();
    var type = pageType();
    track('page_view', {type: type, lang: EN ? 'en' : 'zh'});
    if (type === '404') track('error_404', {path: location.pathname});
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
