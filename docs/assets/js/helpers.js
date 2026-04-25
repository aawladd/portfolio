const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
const data = () => window.PORTFOLIO_DATA;

function escapeHTML(value = "") {
  return String(value).replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;"
  })[char]);
}

function setText(selector, value, scope = document) {
  qsa(selector, scope).forEach((el) => { el.textContent = value || ""; });
}

function tagsHTML(tags = []) {
  return tags.map(tag => `<span class="tag">${escapeHTML(tag)}</span>`).join("");
}

function itemHTML({ title, label, meta, year, type, venue, status, description, text, tags = [] }) {
  const metaText = [label, meta, year, type, venue, status].filter(Boolean).join(" · ");
  return `
    <article class="item">
      ${metaText ? `<div class="item-meta">${escapeHTML(metaText)}</div>` : ""}
      <h4>${escapeHTML(title)}</h4>
      <p>${escapeHTML(description || text || "")}</p>
      ${tags.length ? `<div class="tag-row">${tagsHTML(tags)}</div>` : ""}
    </article>`;
}

function renderList(selector, items, template) {
  const target = qs(selector);
  if (!target) return;
  target.innerHTML = (items || []).map(template).join("");
}
