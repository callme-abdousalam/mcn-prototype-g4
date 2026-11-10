/* Prototype pédagogique ESMT – Groupe 4. Aucune donnée réelle n'est envoyée au musée. */
(function () {
  // Remplacer par l'ID de mesure GA4 du groupe (ex. "G-AB12CD34EF").
  var GA4_ID = window.GA4_ID || "";
  var WA_NUMBER = "221784525270";

  // ---- Menu mobile
  var btn = document.querySelector(".menu-btn"), nav = document.querySelector(".nav");
  if (btn && nav) btn.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });

  // ---- Mesure (GA4 après consentement)
  var queue = [];
  function track(name, params) {
    params = params || {};
    if (window.gtag && GA4_ID) window.gtag("event", name, params);
    else queue.push([name, params]);
    if (window.console) console.info("[mesure]", name, params);
  }
  window.mcnTrack = track;
  function loadGA() {
    if (!GA4_ID || window.gtag) return;
    var s = document.createElement("script");
    s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA4_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date()); window.gtag("config", GA4_ID);
    queue.forEach(function (e) { window.gtag("event", e[0], e[1]); }); queue = [];
  }
  var consent = null;
  try { consent = localStorage.getItem("mcn-consent"); } catch (e) {}
  var cookie = document.querySelector(".cookie");
  if (consent === "yes") loadGA();
  else if (consent !== "no" && cookie) cookie.classList.add("show");
  document.querySelectorAll("[data-consent]").forEach(function (b) {
    b.addEventListener("click", function () {
      var v = b.getAttribute("data-consent");
      try { localStorage.setItem("mcn-consent", v); } catch (e) {}
      if (cookie) cookie.classList.remove("show");
      if (v === "yes") loadGA();
    });
  });

  // Événements de page
  var page = document.body.getAttribute("data-page");
  if (page === "visite") track("view_infos_pratiques");
  if (page === "expo") track("view_exposition", { exposition: document.body.getAttribute("data-expo") });

  document.addEventListener("click", function (ev) {
    var a = ev.target.closest("[data-track]");
    if (a) track(a.getAttribute("data-track"), { page: page || "" });
  });

  // ---- Billetterie (non disponible dans le prototype)
  var modal = document.querySelector(".modal");
  document.querySelectorAll("[data-billet]").forEach(function (b) {
    b.addEventListener("click", function (e) { e.preventDefault(); track("click_billetterie", { page: page || "" }); if (modal) modal.classList.add("show"); });
  });
  if (modal) modal.addEventListener("click", function (e) {
    if (e.target === modal || e.target.closest("[data-close]")) modal.classList.remove("show");
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && modal) modal.classList.remove("show"); });

  // ---- Formulaires simulés
  document.querySelectorAll("form[data-sim]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!f.reportValidity()) return;
      track(f.getAttribute("data-sim"));
      var ok = f.parentNode.querySelector(".success");
      if (ok) { ok.classList.add("show"); ok.focus && ok.focus(); }
      f.reset();
    });
  });

  // ---- Demande de groupe par WhatsApp (message de test)
  var waBtn = document.querySelector("[data-wa-form]");
  if (waBtn) waBtn.addEventListener("click", function () {
    var f = document.getElementById("form-groupe"), v = function (id) { var el = document.getElementById(id); return el && el.value ? el.value : "à préciser"; };
    var msg = "Bonjour, je souhaite organiser une visite de groupe au Musée des Civilisations noires.\n" +
      "Établissement : " + v("g-etab") + "\nDate souhaitée : " + v("g-date") + "\nNombre d'élèves : " + v("g-nb") +
      "\nNiveau : " + v("g-niveau") + "\n(message de test – projet pédagogique ESMT)";
    track("click_whatsapp_groupe", { page: page || "" });
    window.open("https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
  });
})();
