/* GasTRPartners — interactions & language switching */
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("js");

  var DICT = window.GP_I18N || {};
  var SUPPORTED = ["en", "tr", "fr"];
  var STORAGE_KEY = "gp-lang";
  var OG_LOCALE = { en: "en_GB", tr: "tr_TR", fr: "fr_FR" };

  function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  function initialLang() {
    var q = new URLSearchParams(window.location.search).get("lang");
    if (q && SUPPORTED.indexOf(q.toLowerCase()) > -1) {
      q = q.toLowerCase();
      safeSet(STORAGE_KEY, q);
      return q;
    }
    var s = safeGet(STORAGE_KEY);
    if (s && SUPPORTED.indexOf(s) > -1) return s;
    return "en";
  }

  function setMeta(selector, attr, value) {
    var el = document.querySelector(selector);
    if (el && value) el.setAttribute(attr, value);
  }

  function applyLang(lang, opts) {
    var t = DICT[lang] || DICT.en;
    if (!t) return;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (t[key] == null) return;
      // Strings may contain simple entities/markup (&amp;, <br>, <em>) from our own dictionary.
      el.innerHTML = t[key];
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-aria");
      if (t[key]) el.setAttribute("aria-label", t[key]);
    });
    doc.setAttribute("lang", lang);
    if (t["meta.title"]) document.title = t["meta.title"];
    setMeta('meta[name="description"]', "content", t["meta.description"]);
    setMeta('meta[property="og:title"]', "content", t["meta.title"]);
    setMeta('meta[property="og:description"]', "content", t["meta.og"]);
    setMeta('meta[name="twitter:title"]', "content", t["meta.title"]);
    setMeta('meta[name="twitter:description"]', "content", t["meta.og"]);
    setMeta('meta[property="og:locale"]', "content", OG_LOCALE[lang]);

    document.querySelectorAll(".lang-switch button").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-lang") === lang ? "true" : "false");
    });

    if (opts && opts.updateUrl) {
      var url = new URL(window.location.href);
      if (lang === "en") url.searchParams.delete("lang"); else url.searchParams.set("lang", lang);
      history.replaceState(null, "", url.pathname + url.search + url.hash);
    }
  }

  var current = initialLang();
  if (current !== "en") applyLang(current);
  else applyLang("en");

  document.querySelectorAll(".lang-switch button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var lang = btn.getAttribute("data-lang");
      if (lang === current) return;
      current = lang;
      safeSet(STORAGE_KEY, lang);
      document.body.classList.add("lang-fade");
      setTimeout(function () {
        applyLang(lang, { updateUrl: true });
        document.body.classList.remove("lang-fade");
      }, 180);
    });
  });

  /* Sticky header state */
  var header = document.querySelector(".site-header");
  function onScroll() { header.classList.toggle("scrolled", window.scrollY > 24); }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Mobile nav */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("main-nav");
  function closeNav() {
    nav.classList.remove("open");
    header.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
  }
  toggle.addEventListener("click", function () {
    var open = !nav.classList.contains("open");
    nav.classList.toggle("open", open);
    header.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeNav); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });

  /* Reveal on scroll */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* Active nav link */
  var links = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute("href")); });
  if ("IntersectionObserver" in window) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (l) {
            var on = l.getAttribute("href") === "#" + en.target.id;
            l.classList.toggle("active", on);
            if (on) l.setAttribute("aria-current", "true"); else l.removeAttribute("aria-current");
          });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { if (s) so.observe(s); });
  }
})();
