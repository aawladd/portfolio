/* Site admin: publications and projects.
   The GitHub token is encrypted (AES-GCM, key from PBKDF2-SHA256 of your password) and kept only
   in this browser's localStorage. Unlocked, it lives in memory until the page is closed or locked. */
(function () {
  const REPO = { owner: "aawladd", name: "portfolio", branch: "main" };
  const STORE_KEY = "siteAdmin.v1";
  const PBKDF2_ITERATIONS = 310000;

  const { TYPES, esc, citationHTML, withKeys, summaryText } = window.Pubs;
  const $ = (id) => document.getElementById(id);
  const enc = new TextEncoder();
  const dec = new TextDecoder();

  let token = null;
  const stores = {
    pubs: { path: "docs/assets/data/publications.json", label: "publications", empty: { me: "", publications: [] } },
    projects: { path: "docs/assets/data/projects.json", label: "projects", empty: { projects: [] } },
  };
  for (const s of Object.values(stores)) Object.assign(s, { data: null, sha: null, original: "", changes: [] });
  const pubs = () => stores.pubs.data;
  const projects = () => stores.projects.data;

  let editingIndex = -1;   // publication being edited (-1 = new)
  let pendingIndex = -1;   // Scholar pending item being added
  let pEditingIndex = -1;  // project being edited (-1 = new)
  let lastText = null;     // last focused project textarea (for "Insert citation")

  /* ---------- helpers ---------- */
  function msg(id, text, kind = "info") {
    const el = $(id);
    el.className = `msg show ${kind}`;
    el.innerHTML = text;
  }
  const clearMsg = (id) => { $(id).className = "msg"; };
  const short = (t) => (String(t).length > 50 ? String(t).slice(0, 48) + "…" : String(t));
  const norm = (t) => String(t || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const serialize = (d) => JSON.stringify(d, null, 2) + "\n";
  const isDirty = (s) => s.data && serialize(s.data) !== s.original;

  function slugify(text) {
    return text.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase()
      .replace(/[^a-z0-9]+/g, " ").trim().split(" ").filter((w) => w.length > 2).slice(0, 6).join("-") || "item";
  }
  function uniqueId(base, list, skipIndex) {
    const taken = new Set(list.filter((_, i) => i !== skipIndex).map((x) => x.id));
    let id = base, n = 2;
    while (taken.has(id)) id = `${base}-${n++}`;
    return id;
  }
  const cleanId = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");

  /* ---------- crypto ---------- */
  const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
  const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

  async function deriveKey(password, salt) {
    const base = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
      base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  }
  async function storeToken(tok, password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt);
    const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(tok));
    localStorage.setItem(STORE_KEY, JSON.stringify({ salt: b64(salt), iv: b64(iv), ct: b64(ct) }));
  }
  async function readToken(password) {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY));
    const key = await deriveKey(password, unb64(saved.salt));
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(saved.iv) }, key, unb64(saved.ct));
    return dec.decode(pt);
  }
  function hasStoredToken() {
    try { return !!localStorage.getItem(STORE_KEY); } catch { return false; }
  }

  /* ---------- GitHub API ---------- */
  async function gh(path, options = {}, tok = token) {
    const res = await fetch(`https://api.github.com/repos/${REPO.owner}/${REPO.name}${path}`, {
      ...options,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${tok}`,
        "X-GitHub-Api-Version": "2022-11-28",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
      },
    });
    if (!res.ok) {
      let detail = "";
      try { detail = (await res.json()).message || ""; } catch {}
      const err = new Error(`GitHub ${res.status}${detail ? `: ${detail}` : ""}`);
      err.status = res.status;
      throw err;
    }
    return res.status === 204 ? null : res.json();
  }

  const utf8ToB64 = (text) => {
    const bytes = enc.encode(text);
    let bin = "";
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  };
  const b64ToUtf8 = (s) => dec.decode(unb64(s.replace(/\s/g, "")));

  async function loadStore(store, tok = token) {
    try {
      const file = await gh(`/contents/${store.path}?ref=${REPO.branch}&t=${Date.now()}`, {}, tok);
      store.sha = file.sha;
      store.original = b64ToUtf8(file.content);
      store.data = JSON.parse(store.original);
    } catch (err) {
      if (err.status !== 404 || store === stores.pubs) throw err;
      store.sha = null;                       // file does not exist yet; publishing creates it
      store.data = structuredClone(store.empty);
      store.original = serialize(store.data);
    }
    store.changes = [];
  }

  function explain(err) {
    if (err.status === 401) return "GitHub rejected the token (expired or revoked). Use “Forget this device” and set up a new token.";
    if (err.status === 403) return "The token lacks permission for this action. Check its repository access and permissions.";
    if (err.status === 404) return "Not found. Check that the token has access to the aawladd/portfolio repository.";
    if (err.status === 409 || err.status === 422) return "The data changed on GitHub since this page loaded (for example the weekly Scholar sync ran). Your edits are kept here: press <strong>Reload from GitHub</strong> to get the latest version, then redo the edits.";
    return esc(err.message || String(err));
  }

  /* ---------- views ---------- */
  function show(view) {
    ["view-setup", "view-lock", "view-editor"].forEach((v) => { $(v).hidden = v !== view; });
    if (view === "view-lock") setTimeout(() => $("lock-pw").focus(), 0);
  }

  function selectTab(name) {
    document.querySelectorAll("[data-tab]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tab === name)));
    $("pane-pubs").hidden = name !== "pubs";
    $("pane-projects").hidden = name !== "projects";
  }

  async function openEditor() {
    show("view-editor");
    msg("editor-msg", "Loading data from GitHub…");
    try {
      await Promise.all(Object.values(stores).map((s) => loadStore(s)));
      clearMsg("editor-msg");
      closeForm();
      closeProjectForm();
      renderAll();
    } catch (err) {
      msg("editor-msg", explain(err), "err");
    }
  }

  function renderAll() {
    renderPubs();
    renderPending();
    renderProjects();
    renderDirty();
  }

  function renderDirty() {
    const all = Object.values(stores).flatMap((s) => s.changes);
    const dirty = Object.values(stores).some(isDirty);
    $("dirty-bar").classList.toggle("show", dirty);
    $("dirty-list").textContent = all.slice(-3).join("; ") + (all.length > 3 ? ` (+${all.length - 3} more)` : "");
  }

  /* ---------- publications list ---------- */
  function renderPubs() {
    const d = pubs();
    const keyed = withKeys(d.publications);
    const sc = d.scholar;
    $("pub-summary-admin").innerHTML = esc(summaryText(d.publications, d.me) || "No publications yet.") +
      (sc && sc.citations != null ? `<br />Google Scholar: ${Number(sc.citations)} citations · h-index ${Number(sc.hIndex)} · i10-index ${Number(sc.i10)}${sc.updated ? ` (synced ${esc(sc.updated)})` : ""}` : "");
    $("pub-rows").innerHTML = TYPES.map((t) => {
      const items = keyed.map((p, i) => ({ p, i })).filter(({ p }) => p.type === t.key);
      if (!items.length) return "";
      return `<div class="group-title">${t.label}</div>` + items.map(({ p, i }, n) => `
        <div class="pub-row">
          <span class="k">${p.key}</span>
          <div><div class="t">${esc(p.title)}</div><div class="v">${esc(p.venue)}${p.year ? ` · ${esc(p.year)}` : ""}${p.citations ? ` · cited by ${Number(p.citations)}` : ""}</div></div>
          <div class="ctl">
            <button class="b sm" data-act="up" data-i="${i}" ${n === 0 ? "disabled" : ""} aria-label="Move up">↑</button>
            <button class="b sm" data-act="down" data-i="${i}" ${n === items.length - 1 ? "disabled" : ""} aria-label="Move down">↓</button>
            <button class="b sm" data-act="edit" data-i="${i}">Edit</button>
            <button class="b sm danger" data-act="del" data-i="${i}">Delete</button>
          </div>
        </div>`).join("");
    }).join("");
  }

  function renderPending() {
    const list = pubs().pending || [];
    $("pending-panel").hidden = !list.length;
    $("pending-rows").innerHTML = list.map((p, i) => `
      <div class="pub-row">
        <span class="k">?</span>
        <div><div class="t">${esc(p.title)}</div><div class="v">${esc(p.authors)}${p.venue ? ` · ${esc(p.venue)}` : ""}${p.year ? ` · ${esc(p.year)}` : ""}</div></div>
        <div class="ctl">
          <button class="b sm" data-pact="add" data-i="${i}">Add…</button>
          <button class="b sm danger" data-pact="ignore" data-i="${i}">Ignore</button>
        </div>
      </div>`).join("");
  }

  function addIgnore(p) {
    const d = pubs();
    d.ignore = Array.from(new Set([...(d.ignore || []), norm(p.title), ...(p.doi ? [p.doi.toLowerCase()] : [])]));
  }

  function moveWithinGroup(list, i, dir, groupKey) {
    let j = i + dir;
    while (j >= 0 && j < list.length && list[j][groupKey] !== list[i][groupKey]) j += dir;
    if (j < 0 || j >= list.length) return false;
    [list[i], list[j]] = [list[j], list[i]];
    return true;
  }

  function insertionPoint(list, key, value, order) {
    const first = list.findIndex((x) => x[key] === value);
    if (first >= 0) return first;
    const rank = order.indexOf(value);
    const idx = list.findIndex((x) => order.indexOf(x[key]) > rank);
    return idx < 0 ? list.length : idx;
  }

  /* ---------- publication form ---------- */
  const FIELDS = ["doi", "type", "year", "authors", "title", "venue", "details", "url", "note", "id"];

  function readForm() {
    const v = {};
    FIELDS.forEach((f) => { v[f] = $(`f-${f}`).value.trim(); });
    return {
      id: v.id, type: v.type, authors: v.authors.replace(/\s+/g, " "), corresponding: $("f-corr").checked,
      year: v.year, title: v.title.replace(/\s+/g, " "), venue: v.venue, details: v.details,
      doi: normalizeDoi(v.doi), url: v.url, note: v.note,
    };
  }

  function fillForm(p) {
    FIELDS.forEach((f) => { $(`f-${f}`).value = p[f] || ""; });
    $("f-type").value = p.type || "journal";
    $("f-corr").checked = !!p.corresponding;
    $("f-id").dataset.auto = p.id ? "0" : "1";
    updatePreview();
  }

  function updatePreview() {
    const p = readForm();
    if ($("f-id").dataset.auto === "1" && p.title) $("f-id").value = uniqueId(slugify(p.title), pubs().publications, editingIndex);
    $("f-preview").innerHTML = p.title || p.authors ? citationHTML(p, pubs().me) : '<span class="muted">Fill in the fields to see the citation.</span>';
  }

  function openForm(index, preset) {
    editingIndex = index;
    $("form-title").textContent = index < 0 ? "Add publication" : "Edit publication";
    fillForm(index < 0 ? (preset || { type: "journal", authors: pubs().me ? `${pubs().me}, ` : "" }) : pubs().publications[index]);
    clearMsg("form-msg");
    $("form-panel").hidden = false;
    $("form-panel").scrollIntoView({ behavior: "smooth", block: "start" });
    $(index < 0 ? "f-doi" : "f-title").focus({ preventScroll: true });
  }

  function closeForm() {
    $("form-panel").hidden = true;
    editingIndex = -1;
    pendingIndex = -1;
  }

  function saveForm() {
    const d = pubs();
    const p = readForm();
    const missing = [["authors", "authors"], ["title", "title"], ["venue", "journal / venue"]].filter(([k]) => !p[k]).map(([, l]) => l);
    if (missing.length) return msg("form-msg", `Please fill in: ${missing.join(", ")}.`, "err");
    if (p.year && !/^\d{4}$/.test(p.year)) return msg("form-msg", "Year should be four digits.", "err");
    if (p.url && !/^https?:\/\//i.test(p.url)) return msg("form-msg", "The extra link must start with http:// or https://.", "err");
    const dupIndex = d.publications.findIndex((x, i) => i !== editingIndex &&
      ((p.doi && x.doi && x.doi.toLowerCase() === p.doi.toLowerCase()) || norm(x.title) === norm(p.title)));
    if (dupIndex >= 0) {
      const key = withKeys(d.publications)[dupIndex].key;
      return msg("form-msg", `This paper is already in your list as [${key}]. Edit that entry instead${pendingIndex >= 0 ? ", or press Ignore on the Scholar item" : ""}.`, "err");
    }
    p.id = uniqueId(cleanId(p.id) || slugify(p.title), d.publications, editingIndex);
    const order = TYPES.map((t) => t.key);

    if (editingIndex < 0) {
      d.publications.splice(insertionPoint(d.publications, "type", p.type, order), 0, p);
      stores.pubs.changes.push(`Add “${short(p.title)}”`);
      if (pendingIndex >= 0) d.pending.splice(pendingIndex, 1);
    } else {
      const before = d.publications[editingIndex];
      const merged = { ...before, ...p }; // keep synced fields such as citations
      if (before.type !== p.type) {
        d.publications.splice(editingIndex, 1);
        d.publications.splice(insertionPoint(d.publications, "type", p.type, order), 0, merged);
        stores.pubs.changes.push(`Move “${short(p.title)}” to ${Pubs.TYPE[p.type].label}`);
      } else {
        d.publications[editingIndex] = merged;
        stores.pubs.changes.push(`Edit “${short(p.title)}”`);
      }
    }
    closeForm();
    renderAll();
    msg("editor-msg", "Saved to the list. Press <strong>Publish to website</strong> when you are done.", "ok");
  }

  /* ---------- DOI / Crossref ---------- */
  function normalizeDoi(s) {
    return String(s || "").trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i, "").replace(/^doi:\s*/i, "");
  }
  function initials(given) {
    return String(given || "").split(/[\s.]+/).filter(Boolean)
      .map((part) => part.split("-").filter(Boolean).map((x) => x[0].toUpperCase() + ".").join("-")).join(" ");
  }
  function joinAuthors(list) {
    if (list.length <= 1) return list.join("");
    return list.slice(0, -1).join(", ") + ", & " + list[list.length - 1];
  }
  const stripTags = (s) => String(s || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

  async function fetchDoi() {
    const doi = normalizeDoi($("f-doi").value);
    if (!doi) return msg("form-msg", "Enter a DOI first.", "err");
    const d = pubs();
    $("doi-btn").disabled = true;
    msg("form-msg", "Looking up the DOI on Crossref…");
    try {
      const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
      if (!res.ok) throw new Error(res.status === 404 ? "DOI not found on Crossref." : `Crossref error ${res.status}.`);
      const m = (await res.json()).message;
      const meMatch = String(d.meMatch || "").toLowerCase();
      const authors = (m.author || []).map((a) => {
        const full = `${a.given || ""} ${a.family || ""} ${a.name || ""}`.toLowerCase();
        if (meMatch && d.me && full.includes(meMatch)) return d.me; // Crossref often splits "Md. Awlad Hossain" oddly
        return a.family ? `${a.family}, ${initials(a.given)}`.replace(/, $/, "") : a.name;
      }).filter(Boolean);
      const dateParts = (m["published-print"] || m["published-online"] || m.published || m.issued || {})["date-parts"];
      const typeMap = { "journal-article": "journal", "proceedings-article": "conference", "book-chapter": "chapter", "posted-content": "preprint" };
      const vol = m.volume ? `${m.volume}${m.issue ? `(${m.issue})` : ""}` : "";
      const pages = m.page || m["article-number"] || "";
      fillForm({
        ...readForm(),
        doi,
        type: typeMap[m.type] || $("f-type").value,
        authors: joinAuthors(authors) || $("f-authors").value,
        year: dateParts && dateParts[0] && dateParts[0][0] ? String(dateParts[0][0]) : "",
        title: stripTags((m.title || [])[0]),
        venue: stripTags((m["container-title"] || [])[0]),
        details: [vol, pages].filter(Boolean).join(", "),
        id: editingIndex < 0 ? "" : $("f-id").value,
      });
      updatePreview();
      const mine = d.me && $("f-authors").value.includes(d.me);
      msg("form-msg", "Filled from Crossref. Please check the details" +
        (mine ? "." : ` — your name was not found as “${esc(d.me)}”, so edit the author list to match it exactly if you want it bolded.`), mine ? "ok" : "info");
    } catch (err) {
      msg("form-msg", esc(err.message), "err");
    } finally {
      $("doi-btn").disabled = false;
    }
  }

  /* Pending Scholar item → try to find its DOI on Crossref by title, else prefill what Scholar has. */
  async function addPending(i) {
    const item = pubs().pending[i];
    openForm(-1, { type: "journal", title: item.title, authors: item.authors, venue: item.venue, year: item.year });
    pendingIndex = i;
    msg("form-msg", "Searching Crossref for this title…");
    try {
      const q = encodeURIComponent(item.title);
      const res = await fetch(`https://api.crossref.org/works?query.bibliographic=${q}&rows=3&select=DOI,title`);
      const hits = (await res.json()).message.items || [];
      const hit = hits.find((h) => norm((h.title || [])[0]) === norm(item.title));
      if (hit) {
        $("f-doi").value = hit.DOI;
        await fetchDoi();
        pendingIndex = i;
      } else {
        msg("form-msg", "No DOI found. Scholar’s details are filled in (authors are in short form) — please complete them.", "info");
      }
    } catch {
      msg("form-msg", "Could not search Crossref. Please complete the details manually.", "info");
    }
  }

  /* ---------- projects ---------- */
  const PFIELDS = ["title", "status", "dates", "where", "summary", "bullets", "link", "id"];

  function pubKeys() { return Projects.keyMap(pubs()); }

  function renderProjects() {
    const list = projects().projects;
    const keys = pubKeys();
    $("project-rows").innerHTML = Projects.STATUS.map((s) => {
      const items = list.map((p, i) => ({ p, i })).filter(({ p }) => p.status === s.key);
      return `<div class="group-title">${s.label}</div>` + (items.length ? items.map(({ p, i }, n) => `
        <div class="pub-row">
          <span class="k">${n + 1}</span>
          <div><div class="t">${esc(p.title)}</div><div class="v">${esc(p.dates || "")}${p.where ? `${p.dates ? " · " : ""}${Projects.richText(p.where, keys)}` : ""}</div></div>
          <div class="ctl">
            <button class="b sm" data-ract="up" data-i="${i}" ${n === 0 ? "disabled" : ""} aria-label="Move up">↑</button>
            <button class="b sm" data-ract="down" data-i="${i}" ${n === items.length - 1 ? "disabled" : ""} aria-label="Move down">↓</button>
            <button class="b sm" data-ract="toggle" data-i="${i}">${s.key === "current" ? "Mark past" : "Mark current"}</button>
            <button class="b sm" data-ract="edit" data-i="${i}">Edit</button>
            <button class="b sm danger" data-ract="del" data-i="${i}">Remove</button>
          </div>
        </div>`).join("") : '<p class="note" style="padding: 8px 0">None.</p>');
    }).join("");

    $("p-cite").innerHTML = '<option value="">Cite a publication…</option>' +
      withKeys(pubs().publications).map((p) => `<option value="${esc(p.id)}">[${p.key}] ${esc(short(p.title))}</option>`).join("");
  }

  function readProject() {
    const v = {};
    PFIELDS.forEach((f) => { v[f] = $(`p-${f}`).value.trim(); });
    return {
      id: v.id, status: v.status, title: v.title, dates: v.dates, where: v.where, summary: v.summary,
      bullets: v.bullets.split("\n").map((x) => x.trim()).filter(Boolean), link: v.link,
    };
  }

  function fillProject(p) {
    PFIELDS.forEach((f) => { $(`p-${f}`).value = f === "bullets" ? (p.bullets || []).join("\n") : p[f] || ""; });
    $("p-status").value = p.status || "current";
    $("p-id").dataset.auto = p.id ? "0" : "1";
    updateProjectPreview();
  }

  function updateProjectPreview() {
    const p = readProject();
    if ($("p-id").dataset.auto === "1" && p.title) $("p-id").value = uniqueId(slugify(p.title), projects().projects, pEditingIndex);
    $("p-preview").innerHTML = p.title ? Projects.projectHTML(p, pubKeys()) : '<span class="muted">Fill in the fields to see the project.</span>';
  }

  function openProjectForm(index) {
    pEditingIndex = index;
    $("pform-title").textContent = index < 0 ? "Add project" : "Edit project";
    fillProject(index < 0 ? { status: "current" } : projects().projects[index]);
    clearMsg("pform-msg");
    $("pform-panel").hidden = false;
    $("pform-panel").scrollIntoView({ behavior: "smooth", block: "start" });
    $("p-title").focus({ preventScroll: true });
  }

  function closeProjectForm() {
    $("pform-panel").hidden = true;
    pEditingIndex = -1;
  }

  function saveProject() {
    const list = projects().projects;
    const p = readProject();
    if (!p.title) return msg("pform-msg", "Please enter a title.", "err");
    if (!p.summary && !p.bullets.length) return msg("pform-msg", "Please add a description or at least one key point.", "err");
    if (p.link && !/^https?:\/\//i.test(p.link)) return msg("pform-msg", "The link must start with http:// or https://.", "err");
    p.id = uniqueId(cleanId(p.id) || slugify(p.title), list, pEditingIndex);
    const order = Projects.STATUS.map((s) => s.key);
    if (pEditingIndex < 0) {
      list.splice(insertionPoint(list, "status", p.status, order), 0, p);
      stores.projects.changes.push(`Add project “${short(p.title)}”`);
    } else {
      const before = list[pEditingIndex];
      if (before.status !== p.status) {
        list.splice(pEditingIndex, 1);
        list.splice(insertionPoint(list, "status", p.status, order), 0, p);
      } else {
        list[pEditingIndex] = p;
      }
      stores.projects.changes.push(`Edit project “${short(p.title)}”`);
    }
    closeProjectForm();
    renderAll();
    msg("editor-msg", "Saved to the list. Press <strong>Publish to website</strong> when you are done.", "ok");
  }

  function insertCitation() {
    const id = $("p-cite").value;
    if (!id) return;
    const el = lastText || $("p-summary");
    const token = ` {pub:${id}}`;
    const at = el.selectionStart ?? el.value.length;
    el.value = el.value.slice(0, at).replace(/\s+$/, "") + token + el.value.slice(el.selectionEnd ?? at);
    el.focus();
    $("p-cite").value = "";
    updateProjectPreview();
  }

  /* ---------- publish / workflows ---------- */
  async function publish() {
    const btn = $("publish-btn");
    btn.disabled = true;
    msg("editor-msg", "Publishing to GitHub…");
    const links = [];
    try {
      for (const store of Object.values(stores)) {
        if (!isDirty(store)) continue;
        const text = serialize(store.data);
        const summary = store.changes.length === 1 ? store.changes[0] : `Update ${store.label} (${store.changes.length || 1} changes)`;
        const res = await gh(`/contents/${store.path}`, {
          method: "PUT",
          body: JSON.stringify({
            message: `${summary}\n\n${store.changes.map((c) => `- ${c}`).join("\n")}\n\nVia the site admin page.`,
            content: utf8ToB64(text),
            ...(store.sha ? { sha: store.sha } : {}),
            branch: REPO.branch,
          }),
        });
        store.sha = res.content.sha;
        store.original = text;
        store.changes = [];
        links.push(`<a href="${res.commit.html_url}" target="_blank" rel="noopener">${store.label}</a>`);
      }
      renderAll();
      msg("editor-msg", `Published. The live site will update in about a minute. View commit: ${links.join(", ")}`, "ok");
    } catch (err) {
      renderAll();
      msg("editor-msg", explain(err) + (err.status === 409 || err.status === 422 ? ' <button class="b sm" id="reload-btn">Reload from GitHub</button>' : ""), "err");
      const r = $("reload-btn");
      if (r) r.addEventListener("click", openEditor);
    } finally {
      btn.disabled = false;
    }
  }

  async function dispatch(workflow, btn, okText) {
    btn.disabled = true;
    try {
      await gh(`/actions/workflows/${workflow}/dispatches`, { method: "POST", body: JSON.stringify({ ref: REPO.branch }) });
      msg("editor-msg", okText, "ok");
    } catch (err) {
      msg("editor-msg", err.status === 403 || err.status === 404
        ? "Could not start the job. Give the token <code>Actions: Read and write</code> permission. (It also runs automatically on schedule.)"
        : explain(err), "err");
    } finally {
      btn.disabled = false;
    }
  }

  function forget() {
    if (!confirm("Remove the saved token from this browser? You will need to enter a GitHub token again.")) return;
    try { localStorage.removeItem(STORE_KEY); } catch {}
    token = null;
    show("view-setup");
  }

  const hasUnpublished = () => Object.values(stores).some(isDirty);

  /* ---------- wiring ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    if (!window.crypto || !crypto.subtle) {
      document.body.innerHTML = '<p style="padding:32px">This page needs a secure (https) connection.</p>';
      return;
    }
    $("f-type").innerHTML = TYPES.map((t) => `<option value="${t.key}">${t.label}</option>`).join("");
    $("p-status").innerHTML = Projects.STATUS.map((s) => `<option value="${s.key}">${s.label}</option>`).join("");
    show(hasStoredToken() ? "view-lock" : "view-setup");

    $("setup-btn").addEventListener("click", async () => {
      const tok = $("setup-token").value.trim();
      const pw = $("setup-pw").value;
      if (!tok) return msg("setup-msg", "Paste a GitHub token.", "err");
      if (pw.length < 10) return msg("setup-msg", "Use a password of at least 10 characters.", "err");
      if (pw !== $("setup-pw2").value) return msg("setup-msg", "The passwords do not match.", "err");
      $("setup-btn").disabled = true;
      msg("setup-msg", "Checking the token with GitHub…");
      try {
        await gh(`/contents/${stores.pubs.path}?ref=${REPO.branch}`, {}, tok);
        await storeToken(tok, pw);
        token = tok;
        $("setup-token").value = $("setup-pw").value = $("setup-pw2").value = "";
        openEditor();
      } catch (err) {
        msg("setup-msg", explain(err), "err");
      } finally {
        $("setup-btn").disabled = false;
      }
    });

    $("view-lock").addEventListener("submit", async (e) => {
      e.preventDefault();
      msg("lock-msg", "Unlocking…");
      try {
        token = await readToken($("lock-pw").value);
        $("lock-pw").value = "";
        clearMsg("lock-msg");
        openEditor();
      } catch {
        msg("lock-msg", "Wrong password.", "err");
        $("lock-pw").select();
      }
    });

    $("lock-btn").addEventListener("click", () => {
      if (hasUnpublished() && !confirm("You have unpublished changes. Lock anyway and lose them?")) return;
      token = null;
      for (const s of Object.values(stores)) Object.assign(s, { data: null, changes: [] });
      show("view-lock");
    });
    $("forget-btn").addEventListener("click", forget);
    $("forget-btn-lock").addEventListener("click", forget);
    document.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => selectTab(b.dataset.tab)));

    // publications
    $("add-btn").addEventListener("click", () => openForm(-1));
    $("cancel-btn").addEventListener("click", closeForm);
    $("save-btn").addEventListener("click", saveForm);
    $("doi-btn").addEventListener("click", fetchDoi);
    $("f-doi").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); fetchDoi(); } });
    $("f-id").addEventListener("input", () => { $("f-id").dataset.auto = "0"; });
    FIELDS.forEach((f) => $(`f-${f}`).addEventListener("input", updatePreview));
    $("f-corr").addEventListener("change", updatePreview);

    $("pub-rows").addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-act]");
      if (!btn) return;
      const d = pubs();
      const i = Number(btn.dataset.i);
      const p = d.publications[i];
      if (btn.dataset.act === "edit") return openForm(i);
      if (btn.dataset.act === "del") {
        if (!confirm(`Delete “${p.title}”?\n\nThe Scholar/ORCID sync will not add it back.`)) return;
        addIgnore(p);
        d.publications.splice(i, 1);
        stores.pubs.changes.push(`Delete “${short(p.title)}”`);
        if (editingIndex === i) closeForm();
      } else if (moveWithinGroup(d.publications, i, btn.dataset.act === "up" ? -1 : 1, "type")) {
        stores.pubs.changes.push(`Reorder “${short(p.title)}”`);
      }
      renderAll();
    });

    $("pending-rows").addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-pact]");
      if (!btn) return;
      const i = Number(btn.dataset.i);
      const item = pubs().pending[i];
      if (btn.dataset.pact === "add") return addPending(i);
      addIgnore(item);
      pubs().pending.splice(i, 1);
      stores.pubs.changes.push(`Ignore Scholar item “${short(item.title)}”`);
      renderAll();
    });

    // projects
    $("padd-btn").addEventListener("click", () => openProjectForm(-1));
    $("pcancel-btn").addEventListener("click", closeProjectForm);
    $("psave-btn").addEventListener("click", saveProject);
    $("p-cite-btn").addEventListener("click", insertCitation);
    $("p-id").addEventListener("input", () => { $("p-id").dataset.auto = "0"; });
    PFIELDS.forEach((f) => $(`p-${f}`).addEventListener("input", updateProjectPreview));
    ["p-summary", "p-bullets", "p-where"].forEach((id) => $(id).addEventListener("focus", () => { lastText = $(id); }));

    $("project-rows").addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-ract]");
      if (!btn) return;
      const list = projects().projects;
      const i = Number(btn.dataset.i);
      const p = list[i];
      const act = btn.dataset.ract;
      if (act === "edit") return openProjectForm(i);
      if (act === "del") {
        if (!confirm(`Remove the project “${p.title}”?`)) return;
        list.splice(i, 1);
        stores.projects.changes.push(`Remove project “${short(p.title)}”`);
        if (pEditingIndex === i) closeProjectForm();
      } else if (act === "toggle") {
        const status = p.status === "current" ? "past" : "current";
        list.splice(i, 1);
        list.splice(insertionPoint(list, "status", status, Projects.STATUS.map((s) => s.key)), 0, { ...p, status });
        stores.projects.changes.push(`Mark “${short(p.title)}” as ${status}`);
      } else if (moveWithinGroup(list, i, act === "up" ? -1 : 1, "status")) {
        stores.projects.changes.push(`Reorder “${short(p.title)}”`);
      }
      renderAll();
    });

    // publish & jobs
    $("publish-btn").addEventListener("click", publish);
    $("discard-btn").addEventListener("click", () => {
      if (!confirm("Discard all unpublished changes?")) return;
      for (const s of Object.values(stores)) { s.data = JSON.parse(s.original); s.changes = []; }
      closeForm();
      closeProjectForm();
      renderAll();
      clearMsg("editor-msg");
    });
    $("yt-btn").addEventListener("click", (e) =>
      dispatch("youtube.yml", e.currentTarget, "YouTube refresh started. New videos and view counts appear on the site in 1–2 minutes."));
    $("sync-btn").addEventListener("click", (e) => {
      if (hasUnpublished()) return msg("editor-msg", "Publish or discard your changes first, then run the sync.", "err");
      dispatch("publications.yml", e.currentTarget,
        "Sync started. In 1–2 minutes press <strong>Lock</strong> and unlock again (or reload) to see new papers, citations and items to approve.");
    });

    window.addEventListener("beforeunload", (e) => {
      if (hasUnpublished()) { e.preventDefault(); e.returnValue = ""; }
    });
  });
})();
