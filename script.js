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

  const bgMusic = document.getElementById("bgMusic");
  const musicBtn = document.getElementById("musicBtn");
  let isMusicPlaying = false;

  const prefersReduced =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scrollDuration = prefersReduced ? 0 : 800; // ms, visible slow effect

  const revealSeen = new WeakSet();
  const scrollReveal = new IntersectionObserver(
    function (entries) {
      for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        if (!e.isIntersecting) continue;
        e.target.classList.add("is-visible");
        scrollReveal.unobserve(e.target);
      }
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.1 }
  );

  function observeRevealables() {
    if (prefersReduced) return;
    // Re-observe periodically for dynamic content (wishes)
    document.querySelectorAll(".anim-on-scroll:not(.is-visible)").forEach(function (el) {
      if (revealSeen.has(el)) return;
      revealSeen.add(el);
      scrollReveal.observe(el);
    });
    // Re-run after short delay for new content
    setTimeout(observeRevealables, 500);
  }

  function replayMainTextAnimations(root) {
    if (prefersReduced || !root) return;
    root.querySelectorAll(".anim-text-in").forEach(function (el) {
      el.style.animation = "none";
      void el.offsetHeight;
      el.style.removeProperty("animation");
    });
  }

  var parallaxPairs = [];
  function refreshParallaxPairs() {
    parallaxPairs = [];
    var heroImg = document.querySelector(".hero__figure .hero__photo");
    if (heroImg) parallaxPairs.push({ img: heroImg, amp: 10 });
    document.querySelectorAll(".person__photo").forEach(function (img) {
      parallaxPairs.push({ img: img, amp: 8 });
    });
    document.querySelectorAll(".pg-item .pg-img").forEach(function (img) {
      parallaxPairs.push({ img: img, amp: 12 });
    });
  }
  refreshParallaxPairs();

  function updateParallax() {
    if (prefersReduced || !parallaxPairs.length) return;
    var vh = window.innerHeight || 1;
    var cy = vh * 0.5;
    for (var i = 0; i < parallaxPairs.length; i++) {
      var p = parallaxPairs[i];
      var box = p.img.parentElement;
      if (!box) continue;
      var r = box.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) continue;
      var mid = r.top + r.height * 0.5;
      var off = ((mid - cy) / vh) * p.amp;
      p.img.style.transform = "translate3d(0," + off.toFixed(1) + "px,0) scale(1.05)";
    }
  }

  // ========================================================
  // Ambil Nama Tamu dari URL
  // ========================================================
  // Ambil nama dari URL (contoh: web.com/?to=Nama+Tamu)
  function getGuestNameFromUrl() {
    try {
      const p = new URLSearchParams(window.location.search);
      return (p.get("to") || p.get("nama") || p.get("guest") || p.get("id") || "").trim();
    } catch (_) {
      return "";
    }
  }

  function applyGuestLine(name) {
    if (!name) return;
    const decodedName = decodeURIComponent(name.replace(/\+/g, " "));
    const line = "Kepada Yth. " + decodedName;
    if (gateGuest) {
      gateGuest.textContent = line;
      gateGuest.hidden = false;
    }
    if (heroGuest) {
      heroGuest.textContent = line;
      heroGuest.hidden = false;
    }
  }

  // Inisialisasi data tamu
  const guestName = getGuestNameFromUrl();
  if (guestName) {
    applyGuestLine(guestName);
  }

  const PLACEHOLDER_SRC = "images/placeholder.svg";
  document.querySelectorAll("img.js-photo").forEach(function (img) {
    img.addEventListener("error", function onImgErr() {
      img.removeEventListener("error", onImgErr);
      var srcAttr = img.getAttribute("src") || "";
      if (srcAttr.indexOf("placeholder.svg") !== -1) return;
      img.src = PLACEHOLDER_SRC;
    });
  });

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

  // Auto play music on load
  function initMusic() {
    if (!bgMusic) return;
    bgMusic.volume = 0.35; // Lower volume for auto play
    bgMusic.play().then(function () {
      isMusicPlaying = true;
      if (musicBtn) musicBtn.classList.remove("is-muted");
    }).catch(function (e) {
      console.warn("Auto play blocked by browser:", e);
    });
  }

  function toggleMusic() {
    if (!bgMusic) return;
    if (isMusicPlaying) {
      bgMusic.pause();
      isMusicPlaying = false;
      if (musicBtn) musicBtn.classList.add("is-muted");
    } else {
      bgMusic.play().then(function () {
        isMusicPlaying = true;
        if (musicBtn) musicBtn.classList.remove("is-muted");
      }).catch(function (e) {
        console.warn("Audio play blocked.", e);
      });
    }
  }

  if (musicBtn) {
    musicBtn.addEventListener("click", toggleMusic);
  }

  // Call auto play after DOM loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMusic);
  } else {
    initMusic();
  }

  function showMainChrome() {
    if (iosDock) iosDock.hidden = false;
    if (musicBtn) {
      musicBtn.hidden = false;
      setTimeout(function () {
        musicBtn.classList.add("is-visible");
      }, 50);
    }
  }

  function openInvitation() {
    if (!gate || !main) return;
    gate.classList.add("is-away");
    gate.setAttribute("aria-hidden", "true");
    main.hidden = false;
    showMainChrome();
    try {
      sessionStorage.setItem("undangan-opened", "1");
    } catch (_) { }
    replayMainTextAnimations(main);
    window.requestAnimationFrame(function () {
      smoothScrollTo(0, scrollDuration);
      updateParallax();
    });
    if (!prefersReduced) {
      window.setTimeout(observeRevealables, 80);
    }
    if (!isMusicPlaying) {
      toggleMusic();
    }
  }

  if (gate && main && openBtn) {
    try {
      if (sessionStorage.getItem("undangan-opened") === "1") {
        gate.classList.add("is-away");
        gate.setAttribute("aria-hidden", "true");
        main.hidden = false;
        showMainChrome();
        replayMainTextAnimations(main);
        if (!prefersReduced) {
          window.setTimeout(observeRevealables, 80);
        }
        window.requestAnimationFrame(updateParallax);
      }
    } catch (_) { }
    openBtn.addEventListener("click", openInvitation);
  }

  if (prefersReduced) {
    document.querySelectorAll(".anim-on-scroll").forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else if (main && !main.hidden) {
    observeRevealables();
  }

// Scroll effects fully enabled
  // No disabling - observer handles reveals, WeakSet prevents repeats

  /* Dock + satu listener scroll untuk parallax & tab aktif */
  const dockSections = ["beranda", "galeri", "mempelai", "cerita", "acara", "rsvp"];
  function setDockActive(id) {
    document.querySelectorAll(".ios-dock__item").forEach(function (a) {
      a.classList.toggle("is-active", a.getAttribute("data-section") === id);
    });
  }

  var dockById = {};
  var pickDockActive = null;
  if (iosDock) {
    iosDock.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (e) {
        const href = link.getAttribute("href") || "";
        if (!href.startsWith("#")) return;
        const el = document.querySelector(href);
        if (!el) return;
        e.preventDefault();
        smoothScrollTo(el.offsetTop - 20, scrollDuration); // slight offset for dock
        const id = (href.slice(1) || "").toLowerCase();
        if (id) setDockActive(id);
      });
    });

    dockSections.forEach(function (sid) {
      const node = document.getElementById(sid);
      if (node) dockById[sid] = node;
    });

    pickDockActive = function () {
      const y = window.scrollY + Math.min(160, window.innerHeight * 0.18);
      let current = dockSections[0];
      for (var d = 0; d < dockSections.length; d++) {
        const sid = dockSections[d];
        const sec = dockById[sid];
        if (!sec) continue;
        const top = sec.getBoundingClientRect().top + window.scrollY;
        if (y + 1 >= top) current = sid;
      }
      setDockActive(current);
    };
    pickDockActive();
  }

  // Custom smooth scroll function for visible effect
  function smoothScrollTo(targetY, duration) {
    if (duration <= 0) {
      window.scrollTo(0, targetY);
      return;
    }
    const startY = window.scrollY;
    const distance = targetY - startY;
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // iOS-like easing: cubic-bezier(0.25, 0.1, 0.25, 1)
      const ease = 1 - Math.pow(1 - progress, 3);
      
      window.scrollTo(0, startY + distance * ease);
      
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  }

  var scrollRaf = false;
  function onWindowScroll() {
    if (scrollRaf) return;
    scrollRaf = true;
    requestAnimationFrame(function () {
      scrollRaf = false;
      updateParallax();
      if (pickDockActive) pickDockActive();
      if (toTop) toTop.classList.toggle("is-visible", window.scrollY > 380);
    });
  }
  window.addEventListener("scroll", onWindowScroll, { passive: true });

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
    toTop.addEventListener("click", function () {
      smoothScrollTo(0, scrollDuration);
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
    if (photoLightbox && photoLightbox.open) {
      photoLightbox.close();
      if (lightboxImg) lightboxImg.removeAttribute("src");
      document.body.style.overflow = "";
    }
  }

  function openPhotoLightbox(src, alt) {
    if (!photoLightbox || !lightboxImg || !src) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    if (typeof photoLightbox.showModal === "function") {
      photoLightbox.showModal();
      document.body.style.overflow = "hidden";
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

  // ========================================================
  // Fitur Ucapan & Doa
  // ========================================================
  const wishesListEl = document.getElementById("wishesList");

  // 1. Buat Spreadsheet Baru di Google Drive.
  // 2. Klik Extensions -> Apps Script. Paste kode dari file panduan.
  // 3. Deploy -> New Deployment -> Pilih Web App -> Anyone. Copy URL Deployment ke sini:
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzNL_NLMbomyk0xxYMF64WtYtONiqKvH-RnCpk9ZxVmywDrUkEApxup9mKH_mM-TjdO/exec";

let wishesData = [];
const displayWishesCount = Infinity; // Show all messages, const since never changes

  function formatIndoDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    return d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear();
  }

  function renderWishes() {
    if (!wishesListEl) return;
    wishesListEl.innerHTML = "";

    // Menampilkan dari atas sesuai batas load
    const toRender = wishesData.slice(0, displayWishesCount);

    // Jika tidak ada ucapan, beri teks kosong
      if (wishesData.length === 0) {
        wishesListEl.innerHTML = '<p style="text-align:center; font-size:0.9rem; opacity:0.6;">Belum ada ucapan. Jadilah yang pertama memberikan doa!</p>';
        return;
      }

    toRender.forEach((wish, index) => {
      const card = document.createElement("div");
      card.className = "wish-card glass";

      const badgeClass = wish.attend ? "wish-card__badge" : "wish-card__badge wish-card__badge--dim";
      const badgeText = wish.attend ? "Hadir" : "Tidak Hadir";

      card.innerHTML = `
        <div class="wish-card__header">
          <div>
<h3 class="wish-card__name">${wish.name} <span class="wish-card__blue-badge">✓</span></h3>
            <p class="wish-card__date">${formatIndoDate(wish.date)}</p>
          </div>
          <span class="${badgeClass}">${badgeText}</span>
        </div>
        <p class="wish-card__text">${wish.text}</p>
      `;
      wishesListEl.appendChild(card);
    });

  }

  async function fetchWishes() {
    if (!GOOGLE_SCRIPT_URL) {
      wishesListEl.innerHTML = '<p style="text-align:center; font-size:0.9rem; opacity:0.6; margin-top:2rem;">Tautan Google Script belum diatur di script.js.</p>';
      return;
    }
    try {
      wishesListEl.innerHTML = '<p style="text-align:center; font-size:0.9rem; opacity:0.6; margin-top:2rem;">Memuat ucapan...</p>';
      const res = await fetch(GOOGLE_SCRIPT_URL);
      const rawData = await res.text();
      
      let data;
      try {
        data = JSON.parse(rawData);
      } catch (parseErr) {
        console.error('JSON parse error:', parseErr.message, '- Raw:', rawData.slice(0, 200));
        data = [];
      }

      // Filter & sanitize data
      wishesData = (Array.isArray(data) ? data : []).filter(wish => 
        wish && (typeof wish.name === 'string' || typeof wish.name === 'number') && 
        typeof wish.text === 'string'
      ).map(wish => ({
        name: (function() {
          let n = wish.name;
          if (typeof n === 'string') return n.trim().slice(0, 50);
          if (typeof n === 'number') return String(n).slice(0, 50);
          if (n instanceof Date || /T[0-9]{2}:[0-9]{2}/.test(String(n))) return 'Tamu';
          return 'Tamu';
        })(),
        text: String(wish.text || '').trim().slice(0, 500),
        date: wish.date || new Date().toISOString().split('T')[0],
        attend: Boolean(wish.attend)
      })); 
      
      wishesData.reverse();

      renderWishes();
    } catch (e) {
      console.error("Gagal mengambil ucapan:", e);
      wishesListEl.innerHTML = '<p style="text-align:center; font-size:0.9rem; opacity:0.6; margin-top:2rem;">Gagal memuat ucapan dari server. Silakan muat ulang.</p>';
    }
  }

  // Event listener for "Lebih Banyak" button removed as all wishes now show by default

  // Panggil data awal dari server Google Sheets
  fetchWishes();

  /* Ganti nomor WhatsApp di bawah sebelum dipakai */
  const WA_NUMBER = "6287710549498";
  if (rsvpForm) {
    rsvpForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const submitBtn = rsvpForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML = "<span>Menyimpan...</span>";
      submitBtn.disabled = true;

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

      // Kirim ucapan ke Google Sheets API
      if (GOOGLE_SCRIPT_URL && name && message) {
        try {
          // fetch dengan "text/plain" body mencegah eror CORS preflight
          await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            body: JSON.stringify({
              name: name,
              attend: attend === "hadir",
              message: message
            })
          });

          // Munculkan di layer lokal biar terasa cepat tanpa reload
          const d = new Date();
          const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
          const dateStr = d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear();
          wishesData.unshift({
            name: name,
            text: message,
            date: dateStr,
            attend: attend === "hadir"
          });

          // No need to adjust displayWishesCount - always shows all
          renderWishes();
          showToast("Ucapan tersimpan!");

          // Membersihkan kolom pesan setelah dikirim
          const msgInput = rsvpForm.querySelector('[name="message"]');
          if (msgInput) msgInput.value = "";
        } catch (error) {
          console.error("Gagal simpan ucapan ke server:", error);
          showToast("Gagal menyambung ke server. Meneruskan ke WA...");
        }
      }

      submitBtn.innerHTML = originalBtnText;
      submitBtn.disabled = false;

      const url = "https://wa.me/" + WA_NUMBER + "?text=" + text;
      // Beri sedikit jeda agar toast sempat muncul sebelum pindah ke WA
      setTimeout(() => {
        window.open(url, "_blank", "noopener,noreferrer");
      }, 500);
    });
  }
})();
