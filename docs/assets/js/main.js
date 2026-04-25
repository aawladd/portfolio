document.addEventListener("DOMContentLoaded", () => {
  renderShell();

  const page = document.body.dataset.page;
  const pageRenderers = {
    home: renderHome,
    research: renderResearch,
    projects: renderProjects,
    teaching: renderTeaching,
    youtube: renderYoutube,
    contact: renderContact,
  };
  if (pageRenderers[page]) pageRenderers[page]();

  const navToggle = qs(".nav-toggle");
  const mainNav = qs(".main-nav");

  function closeMenu() {
    document.body.classList.remove("nav-open");
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", "false");

      navToggle.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleMenu();
      });
    }
  }

  function toggleMenu() {
    const isOpen = document.body.classList.toggle("nav-open");
    if (navToggle)
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  }

  if (navToggle) {
    navToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleMenu();
    });
  }

  qsa(".main-nav a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  document.addEventListener("click", (event) => {
    if (!document.body.classList.contains("nav-open")) return;
    if (mainNav && mainNav.contains(event.target)) return;
    if (navToggle && navToggle.contains(event.target)) return;
    closeMenu();
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );

  qsa(".reveal").forEach((el) => observer.observe(el));
});
