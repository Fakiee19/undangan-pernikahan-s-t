(function () {
  const gate = document.getElementById("gate");
  const openBtn = document.getElementById("openGate");
  const main = document.getElementById("mainContent");
  const countdownEl = document.getElementById("countdown");
  const toast = document.getElementById("toast");
  const toTop = document.getElementById("toTop");
  const rsvpForm = document.getElementById("rsvpForm");
  const gateGuest = document.getElementById("gateGuest");
  const heroGuest = document.getElementById("heroGuest");
  const iosDock = document.getElementById("iosDock");

  const prefersReduced =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function getGuestNameFromUrl() {
    try {
      const p = new URLSearchParams(window.location.search);
      const raw = (p.get("to") || p.get("nama") || p.get("guest") || "").trim();
      if (!raw) return "";
      const decoded = decodeURIComponent(raw.replace(/\+/g, " "));
      return decoded.replace(/\s+/g, " ").trim().slice(0, 80);
    } catch (_) {
      return "";
    }
  }

  function applyGuestLine(name) {
    if (!name) return;
    const line = "Kepada Yth. " + name;
    if (gateGuest) {
      gateGuest.textContent = line;
      gateGuest.hidden = false;
    }
    if (heroGuest) {
      heroGuest.textContent = line;
      heroGuest.hidden = false;
    }
  }

  applyGuestLine(getGuestNameFromUrl());

  const PLACEHOLDER_SRC = "images/placeholder.svg";
  document.querySelectorAll("img.js-photo").forEach(function (img) {
    img.addEventListener("error", function onImgErr() {
      img.removeEventListener("error", onImgErr);
      var srcAttr = img.getAttribute("src") || "";
      if (srcAttr.indexOf("placeholder.svg") !== -1) return;
      img.src = PLACEHOLDER_SRC;
    });
  });

  const scrollReveal = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          scrollReveal.unobserve(e.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );

  function observeRevealables() {
    if (prefersReduced) return;
    document.querySelectorAll(".anim-on-scroll").forEach(function (el) {
      scrollReveal.observe(el);
    });
  }

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    requestAnimationFrame(function () {
      toast.classList.add("is-show");
    });
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      toast.classList.remove("is-show");
      toast.hidden = true;
    }, 2400);
  }

  function showMainChrome() {
    if (iosDock) iosDock.hidden = false;
  }

  function openInvitation() {
    if (!gate || !main) return;
    gate.classList.add("is-away");
    gate.setAttribute("aria-hidden", "true");
    main.hidden = false;
    showMainChrome();
    try {
      sessionStorage.setItem("undangan-opened", "1");
    } catch (_) {}
    if (!prefersReduced) {
      window.setTimeout(observeRevealables, 120);
    }
  }

  if (gate && main && openBtn) {
    try {
      if (sessionStorage.getItem("undangan-opened") === "1") {
        gate.classList.add("is-away");
        gate.setAttribute("aria-hidden", "true");
        main.hidden = false;
        showMainChrome();
      }
    } catch (_) {}
    openBtn.addEventListener("click", openInvitation);
  }

  if (prefersReduced) {
    document.querySelectorAll(".anim-on-scroll").forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else if (main && !main.hidden) {
    observeRevealables();
  }

  /* Dock: smooth scroll + active state (iOS tab bar feel) */
  const dockSections = ["beranda", "galeri", "mempelai", "acara", "rsvp"];
  function setDockActive(id) {
    document.querySelectorAll(".ios-dock__item").forEach(function (a) {
      a.classList.toggle("is-active", a.getAttribute("data-section") === id);
    });
  }

  if (iosDock) {
    iosDock.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (e) {
        const href = link.getAttribute("href") || "";
        if (!href.startsWith("#")) return;
        const el = document.querySelector(href);
        if (!el) return;
        e.preventDefault();
        el.scrollIntoView({
          behavior: prefersReduced ? "auto" : "smooth",
          block: "start",
        });
        const id = (href.slice(1) || "").toLowerCase();
        if (id) setDockActive(id);
      });
    });

    const byId = {};
    dockSections.forEach(function (sid) {
      const node = document.getElementById(sid);
      if (node) byId[sid] = node;
    });

    let ticking = false;
    function sectionDocTop(el) {
      return el.getBoundingClientRect().top + window.scrollY;
    }

    function pickActiveFromScroll() {
      ticking = false;
      const y = window.scrollY + Math.min(160, window.innerHeight * 0.18);
      let current = dockSections[0];
      dockSections.forEach(function (sid) {
        const sec = byId[sid];
        if (!sec) return;
        const top = sectionDocTop(sec);
        if (y + 1 >= top) current = sid;
      });
      setDockActive(current);
    }

    function onScrollDock() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(pickActiveFromScroll);
    }

    window.addEventListener("scroll", onScrollDock, { passive: true });
    pickActiveFromScroll();
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function tickCountdown() {
    if (!countdownEl) return;
    const raw = countdownEl.getAttribute("data-date");
    const target = raw ? new Date(raw).getTime() : NaN;
    if (Number.isNaN(target)) return;

    function update() {
      const now = Date.now();
      let diff = target - now;
      const dEl = document.getElementById("cdDays");
      const hEl = document.getElementById("cdHours");
      const mEl = document.getElementById("cdMins");
      const sEl = document.getElementById("cdSecs");
      if (!dEl || !hEl || !mEl || !sEl) return;
      if (diff <= 0) {
        dEl.textContent = "00";
        hEl.textContent = "00";
        mEl.textContent = "00";
        sEl.textContent = "00";
        return;
      }
      const days = Math.floor(diff / 86400000);
      diff -= days * 86400000;
      const hours = Math.floor(diff / 3600000);
      diff -= hours * 3600000;
      const mins = Math.floor(diff / 60000);
      diff -= mins * 60000;
      const secs = Math.floor(diff / 1000);
      dEl.textContent = pad(days);
      hEl.textContent = pad(hours);
      mEl.textContent = pad(mins);
      sEl.textContent = pad(secs);
    }
    update();
    setInterval(update, 1000);
  }
  tickCountdown();

  if (toTop) {
    window.addEventListener(
      "scroll",
      function () {
        toTop.classList.toggle("is-visible", window.scrollY > 380);
      },
      { passive: true }
    );
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  document.querySelectorAll(".copy-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const num = btn.getAttribute("data-target") || "";
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(num).then(
          function () {
            showToast("Nomor rekening telah disalin");
          },
          function () {
            showToast("Salin manual: " + num);
          }
        );
      } else {
        showToast(num);
      }
    });
  });

  const photoLightbox = document.getElementById("photoLightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxClose = document.getElementById("lightboxClose");

  function closePhotoLightbox() {
    if (photoLightbox && photoLightbox.open) photoLightbox.close();
  }

  function openPhotoLightbox(src, alt) {
    if (!photoLightbox || !lightboxImg || !src) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    if (typeof photoLightbox.showModal === "function") {
      photoLightbox.showModal();
    }
  }

  document.querySelectorAll(".js-lightbox-trigger").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var im = btn.querySelector("img");
      if (!im) return;
      var src = im.currentSrc || im.src || "";
      openPhotoLightbox(src, (im.getAttribute("alt") || "").trim());
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener("click", closePhotoLightbox);
  }

  if (photoLightbox) {
    photoLightbox.addEventListener("click", function (e) {
      if (e.target === photoLightbox) closePhotoLightbox();
    });
  }

  /* Ganti nomor WhatsApp di bawah sebelum dipakai */
  const WA_NUMBER = "6287710549498";
  if (rsvpForm) {
    rsvpForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const fd = new FormData(rsvpForm);
      const name = (fd.get("name") || "").toString().trim();
      const guests = (fd.get("guests") || "1").toString();
      const attend = (fd.get("attend") || "").toString();
      const message = (fd.get("message") || "").toString().trim();
      const status = attend === "hadir" ? "Hadir" : "Tidak bisa hadir";
      let text =
        "Konfirmasi Kehadiran — Supriyadi & Hayu Kartikasari%0A%0A" +
        "Nama: " +
        encodeURIComponent(name) +
        "%0A" +
        "Jumlah tamu: " +
        encodeURIComponent(guests) +
        "%0A" +
        "Status: " +
        encodeURIComponent(status);
      if (message) {
        text += "%0A%0AUcapan: " + encodeURIComponent(message);
      }
      const url = "https://wa.me/" + WA_NUMBER + "?text=" + text;
      window.open(url, "_blank", "noopener,noreferrer");
    });
  }
})();
