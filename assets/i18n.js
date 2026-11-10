/* Langues du prototype : français (texte d'origine), anglais, wolof. */
(function () {
  var D = window.MCN_I18N || {}, KEY = "mcn-lang", orig = new WeakMap(), origAttr = new WeakMap(), origTitle = document.title;
  var ATTRS = ["placeholder", "alt", "aria-label", "title"];
  var LANGS = [["fr", "Français", "FR"], ["en", "English", "EN"], ["wo", "Wolof", "WO"]];
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(l) { try { localStorage.setItem(KEY, l); } catch (e) {} }
  function tr(dict, s) { var k = s.trim(); if (!k || !dict || !dict[k]) return s; return s.replace(k, dict[k]); }
  function apply(l) {
    var dict = l === "fr" ? null : D[l];
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null), n;
    while ((n = w.nextNode())) {
      var p = n.parentNode; if (!p || p.nodeName === "SCRIPT" || p.nodeName === "STYLE" || p.closest(".lang-ui")) continue;
      if (!orig.has(n)) orig.set(n, n.nodeValue);
      var o = orig.get(n), v = dict ? tr(dict, o) : o; if (n.nodeValue !== v) n.nodeValue = v;
    }
    document.querySelectorAll("[placeholder],[alt],[aria-label],[title]").forEach(function (el) {
      if (el.closest(".lang-ui")) return;
      var m = origAttr.get(el); if (!m) { m = {}; ATTRS.forEach(function (a) { if (el.hasAttribute(a)) m[a] = el.getAttribute(a); }); origAttr.set(el, m); }
      Object.keys(m).forEach(function (a) { el.setAttribute(a, dict ? tr(dict, m[a]) : m[a]); });
    });
    document.title = dict ? tr(dict, origTitle) : origTitle;
    document.documentElement.lang = l;
    document.querySelectorAll(".lang-switch button").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-l") === l ? "true" : "false"); });
  }
  function choose(l, src) {
    set(l); apply(l);
    document.documentElement.classList.remove("lang-pending");
    var m = document.querySelector(".lang-modal"); if (m) m.remove();
    if (window.mcnTrack) window.mcnTrack("choose_language", { langue: l, source: src });
  }
  // Sélecteur dans la barre
  var bar = document.querySelector(".header .bar"), mb = bar && bar.querySelector(".menu-btn");
  if (bar) {
    var sw = document.createElement("div"); sw.className = "lang-switch lang-ui"; sw.setAttribute("role", "group"); sw.setAttribute("aria-label", "Langue / Language / Làkk");
    sw.innerHTML = '<svg class="globe" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>' +
      LANGS.map(function (x) { return '<button type="button" data-l="' + x[0] + '" title="' + x[1] + '" aria-pressed="false">' + x[2] + "</button>"; }).join("");
    bar.insertBefore(sw, mb);
    sw.addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) choose(b.getAttribute("data-l"), "barre"); });
  }
  var cur = get();
  if (cur && /^(fr|en|wo)$/.test(cur)) { apply(cur); return; }
  apply("fr");
  // Première visite : choix de la langue
  document.documentElement.classList.add("lang-pending");
  var m = document.createElement("div"); m.className = "lang-modal lang-ui"; m.setAttribute("role", "dialog"); m.setAttribute("aria-modal", "true"); m.setAttribute("aria-labelledby", "lang-t");
  m.innerHTML = '<div class="lang-box"><span class="lang-band" aria-hidden="true"></span><img src="/assets/favicon.svg" alt="" width="64" height="64" class="lang-logo">' +
    '<h2 id="lang-t">Bienvenue · Welcome · Dalal ak jàmm</h2><p>Choisissez votre langue<br><span>Choose your language · Tànnal sa làkk</span></p>' +
    '<div class="lang-choices">' +
    '<button type="button" data-l="fr"><b>Français</b><small>Continuer en français</small></button>' +
    '<button type="button" data-l="en"><b>English</b><small>Continue in English</small></button>' +
    '<button type="button" data-l="wo"><b>Wolof</b><small>Wéy ci wolof</small></button></div>' +
    '<p class="lang-note">Vous pourrez changer de langue à tout moment en haut de la page.</p></div>';
  document.body.appendChild(m);
  m.addEventListener("click", function (e) { var b = e.target.closest("button[data-l]"); if (b) choose(b.getAttribute("data-l"), "accueil"); });
  setTimeout(function () { var f = m.querySelector("button"); if (f) f.focus(); }, 50);
})();
