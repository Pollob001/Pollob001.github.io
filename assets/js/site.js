(() => {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("#site-nav");
  const follow = document.querySelector(".follow");
  const urls = document.querySelector("#author-urls");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "Close" : "Menu";
    });
    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "Menu";
      });
    });
  }

  if (follow && urls) {
    follow.addEventListener("click", () => {
      const open = urls.classList.toggle("open");
      follow.setAttribute("aria-expanded", String(open));
    });
  }

  const links = [...document.querySelectorAll(".masthead__links a")];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const markCurrent = () => {
    if (!sections.length) return;
    const marker = window.innerHeight * 0.28;
    let current = sections[0];
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= marker) current = section;
    });
    links.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${current.id}`);
    });
  };

  document.addEventListener("scroll", markCurrent, { passive: true });
  markCurrent();
})();
