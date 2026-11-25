/* =========================================================
   breiscot.dev — interactions
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
  const phrases = [
    "games.",
    "web experiences.",
    "simulations.",
    "an operating system in the browser."
  ];
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
     Project filters
  --------------------------------------------------------- */
  const chips     = $$(".chip");
  const cards     = $$("#project-grid .card");
  const emptyMsg  = $("#grid-empty");

  const applyFilter = (filter) => {
    let visible = 0;

    cards.forEach((card) => {
      const sources = (card.dataset.sources || "").split(/\s+/);
      const playable = card.dataset.playable === "true";

      const show =
        filter === "all" ||
        (filter === "github"   && sources.includes("github")) ||
        (filter === "itch"     && sources.includes("itch")) ||
        (filter === "playable" && playable);

      card.classList.toggle("is-hidden", !show);
      if (show) visible++;
    });

    if (emptyMsg) emptyMsg.hidden = visible !== 0;
  };

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      applyFilter(chip.dataset.filter);
    });
  });

  /* ---------------------------------------------------------
     Card spotlight follows the cursor
  --------------------------------------------------------- */
  cards.forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", e.clientX - r.left + "px");
      card.style.setProperty("--my", e.clientY - r.top + "px");
    });
  });

  /* ---------------------------------------------------------
     Live stats from the GitHub API (falls back silently)
  --------------------------------------------------------- */
  const fetchStats = async () => {
    try {
      const res = await fetch("https://api.github.com/users/Breiscot", {
        headers: { Accept: "application/vnd.github+json" },
      });
      if (!res.ok) return;
      const data = await res.json();

      const repos = $("#stat-repos");
      const followers = $("#stat-followers");
      if (repos && typeof data.public_repos === "number") repos.textContent = data.public_repos;
      if (followers && typeof data.followers === "number") followers.textContent = data.followers;
    } catch (/* offline / rate-limited */ _) {
      /* keep the static values already in the HTML */
    }
  };

  if ("fetch" in window) fetchStats();

  /* ---------------------------------------------------------
     Side mascots — click to say hi
  --------------------------------------------------------- */
  const mascotPhrases = ["hi!", "hey 👋", "gg", "let's build!", "meep!", "hack club!", "boop!", "👋"];

  $$(".mascot").forEach((mascot) => {
    const bubble = mascot.querySelector(".mascot-bubble");
    let hideTimer;

    mascot.addEventListener("click", () => {
      mascot.classList.remove("pop");
      void mascot.offsetWidth; // restart the animation
      if (bubble) bubble.textContent = mascotPhrases[Math.floor(Math.random() * mascotPhrases.length)];
      mascot.classList.add("pop");
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => mascot.classList.remove("pop"), 1600);
    });
  });

  /* ---------------------------------------------------------
     Footer year
  --------------------------------------------------------- */
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
