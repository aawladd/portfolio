/* Renders publications from assets/data/publications.json.
   Shared by the public pages and the admin editor (window.Pubs). */
(function () {
  const TYPES = [
    { key: "journal", label: "Journal Articles", prefix: "J", published: true },
    { key: "conference", label: "Conference Proceedings", prefix: "C", published: true },
    { key: "chapter", label: "Book Chapters", prefix: "B", published: true },
    { key: "review", label: "Manuscripts Under Review", prefix: "U", published: false },
    { key: "preprint", label: "Preprints", prefix: "P", published: false },
  ];
  const TYPE = Object.fromEntries(TYPES.map((t) => [t.key, t]));

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  }

  function endSentence(text) {
    const t = String(text || "").trim();
    return /[.?!]$/.test(t) ? t : t + ".";
  }

  function authorsHTML(p, me) {
    let html = esc(p.authors);
    if (!me) return html;
    const mine = esc(me);
    let first = true;
    return html.split(mine).reduce((acc, part, i) => {
      if (i === 0) return part;
      const mark = first && p.corresponding ? "<sup>†</sup>" : "";
      first = false;
      return acc + `<span class="me">${mine}</span>${mark}` + part;
    }, "");
  }

  function linksHTML(p) {
    const out = [];
    if (p.doi) out.push(`<a class="badge" href="https://doi.org/${esc(p.doi)}" target="_blank" rel="noopener">DOI</a>`);
    if (p.url) out.push(`<a class="badge" href="${esc(p.url)}" target="_blank" rel="noopener">${/\.pdf($|\?)/i.test(p.url) ? "PDF" : "Link"}</a>`);
    if (p.note) out.push(`<span class="badge">${esc(p.note)}</span>`);
    return out.length ? ` <span class="pub-links">${out.join("")}</span>` : "";
  }

  function citationHTML(p, me) {
    const authors = authorsHTML(p, me);
    const year = p.year ? ` (${esc(p.year)}).` : /\.\s*$/.test(authors) ? "" : ".";
    const title = `<span class="ptitle">${esc(endSentence(p.title))}</span>`;
    const details = p.details ? `, ${esc(p.details)}` : "";
    const venue = `<span class="venue">${esc(p.venue)}</span>`;
    let where;
    if (p.type === "review") where = p.venue ? `Submitted to ${venue}.` : "Under review.";
    else if (p.type === "conference" || p.type === "chapter") where = `In ${venue}${details}.`;
    else where = p.venue ? `${venue}${details}.` : "";
    return `${authors}${year} ${title} ${where}${linksHTML(p)}`;
  }

  /* Adds .key ("J1", "U2", ...) to each publication, numbered in list order per type. */
  function withKeys(list) {
    const counters = {};
    return list.map((p) => {
      const t = TYPE[p.type] || TYPE.journal;
      counters[t.key] = (counters[t.key] || 0) + 1;
      return { ...p, key: t.prefix + counters[t.key] };
    });
  }

  function summaryText(list, me) {
    const count = (k) => list.filter((p) => p.type === k).length;
    const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
    const parts = [];
    const j = count("journal");
    const firstAuthor = list.filter((p) => p.type === "journal" && me && p.authors.trim().startsWith(me)).length;
    if (j) parts.push(plural(j, "journal article", "journal articles") + (firstAuthor ? ` (${firstAuthor} first-author)` : ""));
    if (count("conference")) parts.push(plural(count("conference"), "conference paper", "conference papers"));
    if (count("chapter")) parts.push(plural(count("chapter"), "book chapter", "book chapters"));
    if (count("review")) parts.push(plural(count("review"), "manuscript under review", "manuscripts under review"));
    if (count("preprint")) parts.push(plural(count("preprint"), "preprint", "preprints"));
    return parts.join(" · ");
  }

  function sectionsHTML(data) {
    const list = withKeys(data.publications || []);
    return TYPES.map((t) => {
      const items = list.filter((p) => p.type === t.key);
      if (!items.length) return "";
      return `<section aria-labelledby="sec-${t.key}">
        <h2 id="sec-${t.key}">${t.label}</h2>
        <ol class="pub-list">${items.map((p) => `
          <li id="${esc(p.id)}"><span class="pub-key">[${p.key}]</span><div>${citationHTML(p, data.me)}</div></li>`).join("")}
        </ol></section>`;
    }).join("");
  }

  function recent(data, n = 3) {
    return withKeys(data.publications || [])
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => TYPE[p.type] && TYPE[p.type].published)
      .sort((a, b) => (parseInt(b.p.year, 10) || 0) - (parseInt(a.p.year, 10) || 0) || a.i - b.i)
      .slice(0, n)
      .map(({ p }) => p);
  }

  async function load(base = "") {
    const res = await fetch(`${base}assets/data/publications.json`, { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async function renderPage() {
    const sections = document.getElementById("pub-sections");
    const summary = document.getElementById("pub-summary");
    const recentList = document.getElementById("recent-pubs");
    const refs = document.querySelectorAll("[data-pub]");
    if (!sections && !summary && !recentList && !refs.length) return;

    let data;
    try {
      data = await load();
    } catch (err) {
      if (sections) sections.innerHTML = `<p class="muted">Publications could not be loaded. Please see the <a href="assets/files/Md_Awlad_Hossain_CV.pdf">CV</a>.</p>`;
      return;
    }
    if (sections) {
      sections.innerHTML = sectionsHTML(data);
      if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
    }
    if (summary) summary.innerHTML = `${esc(summaryText(data.publications, data.me))} &nbsp;|&nbsp; † corresponding author`;
    if (recentList) recentList.innerHTML = recent(data).map((p) => `<li>${citationHTML(p, data.me)}</li>`).join("");

    const keyed = Object.fromEntries(withKeys(data.publications).map((p) => [p.id, p]));
    refs.forEach((a) => {
      const p = keyed[a.dataset.pub];
      if (p) {
        a.textContent = `[${p.key}]`;
        a.href = `publications.html#${p.id}`;
      }
    });
  }

  window.Pubs = { TYPES, TYPE, esc, citationHTML, withKeys, summaryText, sectionsHTML, load };
  if (!window.PUBS_NO_AUTO) document.addEventListener("DOMContentLoaded", renderPage);
})();
