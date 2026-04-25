document.addEventListener("DOMContentLoaded", () => {
  renderShell();

  const page = document.body.dataset.page;
  const pageRenderers = {
    home: renderHome,
    research: renderResearch,
    projects: renderProjects,
    teaching: renderTeaching,
    youtube: renderYoutube,
    contact: renderContact
  };
  if (pageRenderers[page]) pageRenderers[page]();

  const navToggle = qs(".nav-toggle");
  if (navToggle) {
    navToggle.addEventListener("click", () => {
      document.body.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", document.body.classList.contains("nav-open") ? "true" : "false");
    });
  }

  qsa(".main-nav a").forEach(link => {
    link.addEventListener("click", () => document.body.classList.remove("nav-open"));
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  qsa(".reveal").forEach(el => observer.observe(el));
});
