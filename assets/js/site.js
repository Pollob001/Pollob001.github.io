(function () {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const themeToggle = document.querySelector(".theme-toggle");
  const themeMeta = document.querySelector('meta[name="theme-color"]');

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem("theme", theme); } catch (err) { /* private mode */ }
    if (themeMeta) themeMeta.setAttribute("content", theme === "dark" ? "#07111f" : "#f5f7fb");
    if (themeToggle) {
      const next = theme === "dark" ? "light" : "dark";
      themeToggle.setAttribute("aria-label", "Switch to " + next + " theme");
    }
  }

  const savedTheme = (function () {
    try { return localStorage.getItem("theme"); } catch (err) { return null; }
  })();
  if (savedTheme === "light" || savedTheme === "dark") applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      applyTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });
  }

  const menuButton = document.querySelector(".mobile-menu-button");
  const mobileNav = document.querySelector("#mobile-nav");

  function setMenu(open) {
    if (!menuButton || !mobileNav) return;
    mobileNav.classList.toggle("open", open);
    menuButton.setAttribute("aria-expanded", open ? "true" : "false");
    menuButton.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
    document.body.classList.toggle("menu-open", open);
  }

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      setMenu(menuButton.getAttribute("aria-expanded") !== "true");
    });
    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setMenu(false);
    });
  }

  const progress = document.querySelector(".scroll-progress span");
  const backToTop = document.querySelector(".back-to-top");
  const navLinks = Array.prototype.slice.call(document.querySelectorAll(".desktop-nav a, .mobile-nav a"))
    .filter(function (link) { return (link.getAttribute("href") || "").charAt(0) === "#"; });
  const sections = [];
  const seen = {};
  navLinks.forEach(function (link) {
    const id = link.getAttribute("href").slice(1);
    if (seen[id]) return;
    const section = document.getElementById(id);
    if (section) {
      seen[id] = true;
      sections.push(section);
    }
  });

  function onScroll() {
    const max = root.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
    if (backToTop) backToTop.classList.toggle("visible", window.scrollY > 480);

    const mark = window.innerHeight * 0.28;
    let current = sections[0];
    sections.forEach(function (section) {
      if (section.getBoundingClientRect().top <= mark) current = section;
    });
    navLinks.forEach(function (link) {
      link.classList.toggle("active", current && link.getAttribute("href") === "#" + current.id);
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  const reveals = document.querySelectorAll(".reveal");
  if (reduceMotion) {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  } else if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const delay = Number(entry.target.getAttribute("data-delay")) || 0;
        if (delay) entry.target.style.transitionDelay = delay + "ms";
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  document.querySelectorAll(".filter-button").forEach(function (button) {
    button.addEventListener("click", function () {
      const filter = button.getAttribute("data-filter");
      document.querySelectorAll(".filter-button").forEach(function (item) {
        const on = item === button;
        item.classList.toggle("active", on);
        item.setAttribute("aria-pressed", on ? "true" : "false");
      });
      document.querySelectorAll(".paper-card").forEach(function (card) {
        const show = filter === "all" || card.getAttribute("data-status") === filter;
        card.classList.toggle("hidden", !show);
      });
    });
  });

  function paintCounter(el, value) {
    const prefix = el.getAttribute("data-prefix") || "";
    const suffix = el.getAttribute("data-suffix") || "";
    el.textContent = prefix + value + suffix;
  }

  function animateCounter(el) {
    const target = Number(el.getAttribute("data-target"));
    if (!target && target !== 0) return;
    if (reduceMotion) {
      paintCounter(el, target);
      return;
    }
    const start = performance.now();
    const duration = 900;
    function tick(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      paintCounter(el, Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const counters = document.querySelectorAll(".counter");
  if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { counterObserver.observe(el); });
  } else {
    counters.forEach(animateCounter);
  }

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
