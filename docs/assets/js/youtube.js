/* Shows videos from assets/data/youtube.json (refreshed daily by a GitHub Action).
   Default order combines views and recency: views / (age in days + 14)^0.8,
   so a new video with good traction can rank next to an older, very popular one. */
(function () {
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  const DAY = 86400000;
  const ageDays = (v) => Math.max(0, (Date.now() - Date.parse(v.published)) / DAY);
  const score = (v) => v.views / Math.pow(ageDays(v) + 14, 0.8);

  const SORTS = {
    featured: (a, b) => score(b) - score(a),
    views: (a, b) => b.views - a.views,
    latest: (a, b) => Date.parse(b.published) - Date.parse(a.published),
  };

  const fmtViews = (n) => new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
  const fmtDate = (s) => new Date(s).toLocaleDateString("en-US", { month: "short", year: "numeric" });

  function card(v) {
    const href = v.short ? `https://www.youtube.com/shorts/${v.id}` : `https://www.youtube.com/watch?v=${v.id}`;
    return `<a class="video" href="${href}" target="_blank" rel="noopener">
      <span class="thumb">
        <img src="https://i.ytimg.com/vi/${esc(v.id)}/hqdefault.jpg" alt="" loading="lazy" width="480" height="360" />
        ${v.short ? '<span class="thumb-tag">Short</span>' : ""}
      </span>
      <span class="vtitle">${esc(v.title)}</span>
      <span class="vmeta">${fmtViews(v.views)} views · ${fmtDate(v.published)}</span>
    </a>`;
  }

  function render(target, videos, sort, limit) {
    target.innerHTML = videos.slice().sort(SORTS[sort] || SORTS.featured).slice(0, limit).map(card).join("");
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const grids = document.querySelectorAll("[data-videos]");
    if (!grids.length) return;
    let data;
    try {
      const res = await fetch("assets/data/youtube.json", { cache: "no-cache" });
      if (!res.ok) throw new Error(res.status);
      data = await res.json();
    } catch (err) {
      grids.forEach((g) => { g.innerHTML = '<p class="muted">Videos could not be loaded right now.</p>'; });
      return;
    }

    grids.forEach((grid) => {
      const limit = parseInt(grid.dataset.limit || "12", 10);
      render(grid, data.videos, "featured", limit);
      const controls = document.querySelectorAll(`[data-sort-for="${grid.id}"] [data-sort]`);
      controls.forEach((btn) =>
        btn.addEventListener("click", () => {
          controls.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
          render(grid, data.videos, btn.dataset.sort, limit);
        }));
    });

    document.querySelectorAll("[data-videos-updated]").forEach((el) => {
      el.textContent = new Date(data.updated).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    });
  });
})();
