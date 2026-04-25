function renderShell() {
  const site = data();
  const page = document.body.dataset.page || "";
  document.title = `${document.body.dataset.pageTitle || "Home"} | ${site.profile.name}`;

  setText("[data-name]", site.profile.name);
  setText("[data-role]", site.profile.role);
  setText("[data-tagline]", site.profile.tagline);
  setText("[data-location]", site.profile.location);
  setText("#year", new Date().getFullYear());

  qsa("[data-initials]").forEach(el => { el.textContent = site.profile.initials; });
  qsa("[data-email]").forEach(el => {
    el.textContent = site.profile.email;
    el.setAttribute("href", `mailto:${site.profile.email}`);
  });
  qsa("[data-cv]").forEach(el => { el.setAttribute("href", site.profile.cv || "#"); });
  qsa("[data-scholar]").forEach(el => { el.setAttribute("href", site.profile.profiles.scholar || "#"); });
  qsa("[data-orcid]").forEach(el => { el.setAttribute("href", site.profile.profiles.orcid || "#"); });
  qsa("[data-github]").forEach(el => { el.setAttribute("href", site.profile.profiles.github || "#"); });
  qsa("[data-linkedin]").forEach(el => { el.setAttribute("href", site.profile.profiles.linkedin || "#"); });
  qsa("[data-youtube]").forEach(el => { el.setAttribute("href", site.profile.profiles.youtube || "#"); });
  qsa("[data-avatar]").forEach(el => {
    el.innerHTML = `<img src="${escapeHTML(site.profile.avatar)}" alt="${escapeHTML(site.profile.name)} profile monogram">`;
  });

  const navTarget = qs(".nav-target");
  if (navTarget) {
    navTarget.innerHTML = site.nav.map(item => {
      const active = item.page === page ? "active" : "";
      return `<li><a class="${active}" href="${item.href}" aria-current="${active ? "page" : "false"}">${item.label}</a></li>`;
    }).join("");
  }
}

function renderHome() {
  const site = data();
  setText("#hero-eyebrow", site.home.eyebrow);
  setText("#hero-title", site.home.title);
  setText("#home-summary", site.home.summary);
  renderList("#home-highlights", site.home.highlights, item => `<li>${escapeHTML(item)}</li>`);
  renderList("#home-facts", site.home.facts, item => `<li><strong>${escapeHTML(item.label)}:</strong> ${escapeHTML(item.value)}</li>`);
  renderList("#home-publications", site.publications.slice(0, 2), itemHTML);
  renderList("#home-projects", site.projects.slice(0, 3), itemHTML);
  renderList("#home-teaching", site.teaching.areas.slice(0, 4), item => `<li><strong>${escapeHTML(item.title)}:</strong> ${escapeHTML(item.description)}</li>`);
}

function renderResearch() {
  const site = data();
  setText("#research-statement", site.research.statement);
  renderList("#research-long", site.research.longStatement, paragraph => `<p>${escapeHTML(paragraph)}</p>`);
  renderList("#research-themes", site.research.themes, itemHTML);
  renderList("#research-methods", site.research.methods, item => `<li>${escapeHTML(item)}</li>`);
  renderList("#research-questions", site.research.questions, itemHTML);
  renderList("#research-workflow", site.research.workflow, item => `<li>${escapeHTML(item)}</li>`);
  renderList("#research-publications", site.publications, itemHTML);
}

function renderProjects() {
  const site = data();
  const target = qs("#project-list");
  if (!target) return;

  const render = (filter = "all") => {
    const projects = filter === "all" ? site.projects : site.projects.filter(project => project.category === filter);
    target.innerHTML = projects.map(itemHTML).join("");
  };

  render();
  qsa("[data-filter]").forEach(button => {
    button.addEventListener("click", () => {
      qsa("[data-filter]").forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      render(button.dataset.filter);
    });
  });
}

function renderTeaching() {
  const site = data();
  setText("#teaching-statement", site.teaching.statement);
  renderList("#teaching-areas", site.teaching.areas, itemHTML);
  renderList("#teaching-mentoring", site.teaching.mentoring, item => `<li>${escapeHTML(item)}</li>`);
}

function renderYoutube() {
  const site = data();
  setText("#youtube-intro", site.youtube.intro);
  renderList("#youtube-focus", site.youtube.focus, item => `<li>${escapeHTML(item)}</li>`);
  renderList("#youtube-featured", site.youtube.videos, itemHTML);
}

function renderContact() {
  const site = data();
  setText("#contact-intro", site.contact.intro);
  renderList("#contact-items", site.contact.items, item => `
    <div class="table-row">
      <strong>${escapeHTML(item.label)}</strong>
      <div>${item.href ? `<a href="${escapeHTML(item.href)}" target="${item.href.startsWith('http') ? '_blank' : '_self'}" rel="noopener">${escapeHTML(item.value)}</a>` : escapeHTML(item.value)}</div>
    </div>`);
  renderList("#contact-notes", site.contact.notes, itemHTML);
}
