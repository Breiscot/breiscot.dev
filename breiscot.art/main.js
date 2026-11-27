/* =========================================================
   breiscot.art — interactions
   ========================================================= */
(function () {
  "use strict";

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------------------------------------------------------
     Header: border on scroll + mobile menu
  --------------------------------------------------------- */
  const header   = $(".site-header");
  const toggle   = $("#nav-toggle");
  const navLinks = $("#nav-links");

  const onScroll = () => {
    header.classList.toggle("scrolled", window.scrollY > 12);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toggle && navLinks) {
    toggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    // close menu when a link is chosen
    navLinks.addEventListener("click", (e) => {
      if (e.target.closest("a")) {
        navLinks.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    // close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navLinks.classList.contains("open")) {
        navLinks.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  /* ---------------------------------------------------------
     Active nav link while scrolling (scroll-spy)
  --------------------------------------------------------- */
  const sections = $$("main section[id]");
  const menuAnchors = $$('.nav-links a[href^="#"]');

  if (sections.length && "IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          menuAnchors.forEach((a) =>
            a.classList.toggle("active", a.getAttribute("href") === "#" + id)
          );
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------------------------------------------------------
     Reveal on scroll
  --------------------------------------------------------- */
  const revealEls = $$(".reveal");

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry, i) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          // small stagger for siblings entering together
          el.style.transitionDelay = Math.min(i * 70, 280) + "ms";
          el.classList.add("in");
          obs.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---------------------------------------------------------
     Typewriter tagline
  --------------------------------------------------------- */
  const typeEl = $("#typewriter");
  const phrases = ["space.", "fantasy.", "fan art."];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (typeEl && !reduceMotion) {
    let phraseIdx = 0;
    let charIdx = phrases[0].length; // start with first phrase fully typed
    let deleting = false;

    const tick = () => {
      const current = phrases[phraseIdx];

      if (!deleting) {
        charIdx++;
        typeEl.textContent = current.slice(0, charIdx);
        if (charIdx >= current.length) {
          deleting = true;
          setTimeout(tick, 1900);          // pause on full phrase
          return;
        }
        setTimeout(tick, 78 + Math.random() * 55);
      } else {
        charIdx--;
        typeEl.textContent = current.slice(0, charIdx);
        if (charIdx <= 0) {
          deleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
          setTimeout(tick, 320);
          return;
        }
        setTimeout(tick, 38);
      }
    };

    setTimeout(tick, 2100);
  }

  /* ---------------------------------------------------------
     Footer year
  --------------------------------------------------------- */
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
