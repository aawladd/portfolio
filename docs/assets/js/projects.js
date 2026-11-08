/* Renders research projects from assets/data/projects.json (needs publications.js first).
   Text supports: {pub:id} → citation link like [J1], _{x} → subscript, ^{x} → superscript. */
(function () {
  const { esc, withKeys } = window.Pubs;

  const STATUS = [
    { key: "current", label: "Current Research" },
    { key: "past", label: "Past Projects" },
  ];

  function keyMap(pubData) {
    return Object.fromEntries(withKeys((pubData && pubData.publications) || []).map((p) => [p.id, p.key]));
  }

  function richText(text, keys) {
    return esc(text)
      .replace(/\s*\{pub:([a-z0-9-]+)\}/g, (_, id) => (keys[id] ? ` <a href="publications.html#${id}">[${keys[id]}]</a>` : ""))
      .replace(/_\{([^}]*)\}/g, "<sub>$1</sub>")
      .replace(/\^\{([^}]*)\}/g, "<sup>$1</sup>");
  }

  function projectHTML(p, keys) {
    const title = p.link
      ? `<a href="${esc(p.link)}" target="_blank" rel="noopener">${esc(p.title)}</a>`
      : esc(p.title);
    const bullets = (p.bullets || []).filter(Boolean);
    const detail = (p.summary ? richText(p.summary, keys) : "") +
      (bullets.length ? `<ul>${bullets.map((b) => `<li>${richText(b, keys)}</li>`).join("")}</ul>` : "");
    return `<div class="entry" id="${esc(p.id)}">
      <span class="title">${title}</span>${p.dates ? `<span class="date">${esc(p.dates)}</span>` : ""}
      ${p.where ? `<span class="where">${richText(p.where, keys)}</span>` : ""}
      ${detail ? `<div class="detail">${detail}</div>` : ""}
    </div>`;
  }

  async function renderPage() {
    const targets = STATUS.map((s) => document.getElementById(`projects-${s.key}`));
    if (!targets.some(Boolean)) return;
    try {
      const [projects, pubs] = await Promise.all([
        fetch("assets/data/projects.json", { cache: "no-cache" }).then((r) => r.json()),
        window.Pubs.load().catch(() => null),
      ]);
      const keys = keyMap(pubs);
      STATUS.forEach((s, i) => {
        const el = targets[i];
        if (!el) return;
        const items = projects.projects.filter((p) => p.status === s.key);
        el.innerHTML = items.map((p) => projectHTML(p, keys)).join("");
        const section = el.closest("section");
        if (section) section.hidden = !items.length;
      });
    } catch (err) {
      targets.forEach((el) => { if (el) el.innerHTML = '<p class="muted">Projects could not be loaded.</p>'; });
    }
  }

  window.Projects = { STATUS, richText, projectHTML, keyMap };
  if (!window.PUBS_NO_AUTO) document.addEventListener("DOMContentLoaded", renderPage);
})();
