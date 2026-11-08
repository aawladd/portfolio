/* Publication admin.
   The GitHub token is encrypted (AES-GCM, key from PBKDF2-SHA256 of your password) and kept only
   in this browser's localStorage. Unlocked, it lives in memory until the page is closed or locked. */
(function () {
  const REPO = { owner: "aawladd", name: "portfolio", branch: "main" };
  const DATA_PATH = "docs/assets/data/publications.json";
  const WORKFLOW = "youtube.yml";
  const STORE_KEY = "siteAdmin.v1";
  const PBKDF2_ITERATIONS = 310000;

  const { TYPES, esc, citationHTML, withKeys, summaryText } = window.Pubs;
  const $ = (id) => document.getElementById(id);
  const enc = new TextEncoder();
  const dec = new TextDecoder();

  let token = null;
  let data = null;        // { me, publications: [...] } being edited
  let original = "";      // JSON last loaded from GitHub
  let sha = null;         // blob sha of the loaded file
  let changes = [];       // human-readable change log for the commit message
  let editingIndex = -1;  // -1 = adding

  /* ---------- messages ---------- */
  function msg(id, text, kind = "info") {
    const el = $(id);
    el.className = `msg show ${kind}`;
    el.innerHTML = text;
  }
  const clearMsg = (id) => { $(id).className = "msg"; };

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

  async function fetchData(tok = token) {
    const file = await gh(`/contents/${DATA_PATH}?ref=${REPO.branch}&t=${Date.now()}`, {}, tok);
    return { sha: file.sha, text: b64ToUtf8(file.content) };
  }

  function explain(err) {
    if (err.status === 401) return "GitHub rejected the token (expired or revoked). Use “Forget this device” and set up a new token.";
    if (err.status === 403) return "The token lacks permission for this action. Check its repository access and permissions.";
    if (err.status === 404) return "Not found. Check that the token has access to the aawladd/portfolio repository.";
    if (err.status === 409) return "The file changed on GitHub since it was loaded. Reload the page and apply your edit again.";
    return esc(err.message || String(err));
  }

  /* ---------- views ---------- */
  function show(view) {
    ["view-setup", "view-lock", "view-editor"].forEach((v) => { $(v).hidden = v !== view; });
    if (view === "view-lock") setTimeout(() => $("lock-pw").focus(), 0);
  }

  async function openEditor() {
    show("view-editor");
    msg("editor-msg", "Loading publications from GitHub…");
    try {
      const file = await fetchData();
      sha = file.sha;
      original = file.text;
      data = JSON.parse(file.text);
      changes = [];
      clearMsg("editor-msg");
      renderList();
    } catch (err) {
      msg("editor-msg", explain(err), "err");
    }
  }

  /* ---------- list ---------- */
  function renderList() {
    const keyed = withKeys(data.publications);
    $("pub-summary-admin").textContent = summaryText(data.publications, data.me) || "No publications yet.";
    $("pub-rows").innerHTML = TYPES.map((t) => {
      const items = keyed.map((p, i) => ({ p, i })).filter(({ p }) => p.type === t.key);
      if (!items.length) return "";
      return `<div class="group-title">${t.label}</div>` + items.map(({ p, i }, n) => `
        <div class="pub-row">
          <span class="k">${p.key}</span>
          <div><div class="t">${esc(p.title)}</div><div class="v">${esc(p.venue)}${p.year ? ` · ${esc(p.year)}` : ""}</div></div>
          <div class="ctl">
            <button class="b sm" data-act="up" data-i="${i}" ${n === 0 ? "disabled" : ""} aria-label="Move up">↑</button>
            <button class="b sm" data-act="down" data-i="${i}" ${n === items.length - 1 ? "disabled" : ""} aria-label="Move down">↓</button>
            <button class="b sm" data-act="edit" data-i="${i}">Edit</button>
            <button class="b sm danger" data-act="del" data-i="${i}">Delete</button>
          </div>
        </div>`).join("");
    }).join("");

    const dirty = JSON.stringify(data, null, 2) + "\n" !== original;
    $("dirty-bar").classList.toggle("show", dirty);
    $("dirty-list").textContent = changes.slice(-3).join("; ") + (changes.length > 3 ? ` (+${changes.length - 3} more)` : "");
  }

  function move(i, dir) {
    const list = data.publications;
    const type = list[i].type;
    let j = i + dir;
    while (j >= 0 && j < list.length && list[j].type !== type) j += dir;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    changes.push(`Reorder “${short(list[j].title)}”`);
    renderList();
  }

  const short = (t) => (t.length > 50 ? t.slice(0, 48) + "…" : t);

  /* ---------- form ---------- */
  const FIELDS = ["doi", "type", "year", "authors", "title", "venue", "details", "url", "note", "id"];

  function slugify(text) {
    return text.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase()
      .replace(/[^a-z0-9]+/g, " ").trim().split(" ").filter((w) => w.length > 2).slice(0, 6).join("-") || "publication";
  }

  function uniqueId(base, skipIndex) {
    const taken = new Set(data.publications.filter((_, i) => i !== skipIndex).map((p) => p.id));
    let id = base, n = 2;
    while (taken.has(id)) id = `${base}-${n++}`;
    return id;
  }

  function readForm() {
    const p = {};
    FIELDS.forEach((f) => { p[f] = $(`f-${f}`).value.trim(); });
    p.doi = normalizeDoi(p.doi);
    p.corresponding = $("f-corr").checked;
    return {
      id: p.id, type: p.type, authors: p.authors.replace(/\s+/g, " "), corresponding: p.corresponding,
      year: p.year, title: p.title.replace(/\s+/g, " "), venue: p.venue, details: p.details,
      doi: p.doi, url: p.url, note: p.note,
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
    if ($("f-id").dataset.auto === "1" && p.title) {
      $("f-id").value = uniqueId(slugify(p.title), editingIndex);
    }
    $("f-preview").innerHTML = p.title || p.authors ? citationHTML(p, data.me) : '<span class="muted">Fill in the fields to see the citation.</span>';
  }

  function openForm(index) {
    editingIndex = index;
    $("form-title").textContent = index < 0 ? "Add publication" : "Edit publication";
    fillForm(index < 0 ? { type: "journal", authors: data.me ? `${data.me}, ` : "" } : data.publications[index]);
    clearMsg("form-msg");
    $("form-panel").hidden = false;
    $("form-panel").scrollIntoView({ behavior: "smooth", block: "start" });
    $(index < 0 ? "f-doi" : "f-title").focus({ preventScroll: true });
  }

  function closeForm() {
    $("form-panel").hidden = true;
    editingIndex = -1;
  }

  function saveForm() {
    const p = readForm();
    const missing = [["authors", "authors"], ["title", "title"], ["venue", "journal / venue"]].filter(([k]) => !p[k]).map(([, l]) => l);
    if (missing.length) return msg("form-msg", `Please fill in: ${missing.join(", ")}.`, "err");
    if (p.year && !/^\d{4}$/.test(p.year)) return msg("form-msg", "Year should be four digits.", "err");
    if (p.url && !/^https?:\/\//i.test(p.url)) return msg("form-msg", "The extra link must start with http:// or https://.", "err");
    const cleanId = p.id.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
    p.id = uniqueId(cleanId || slugify(p.title), editingIndex);

    if (editingIndex < 0) {
      // New items go to the top of their section (newest first).
      const firstOfType = data.publications.findIndex((x) => x.type === p.type);
      const at = firstOfType < 0 ? insertionPointForType(p.type) : firstOfType;
      data.publications.splice(at, 0, p);
      changes.push(`Add “${short(p.title)}”`);
    } else {
      const before = data.publications[editingIndex];
      if (before.type !== p.type) {
        // Moved to another section (e.g. accepted): place it at the top of the new section.
        data.publications.splice(editingIndex, 1);
        const firstOfType = data.publications.findIndex((x) => x.type === p.type);
        data.publications.splice(firstOfType < 0 ? insertionPointForType(p.type) : firstOfType, 0, p);
        changes.push(`Move “${short(p.title)}” to ${Pubs.TYPE[p.type].label}`);
      } else {
        data.publications[editingIndex] = p;
        changes.push(`Edit “${short(p.title)}”`);
      }
    }
    closeForm();
    renderList();
    msg("editor-msg", "Saved to the list. Press <strong>Publish to website</strong> when you are done.", "ok");
  }

  function insertionPointForType(type) {
    const order = TYPES.map((t) => t.key);
    const rank = order.indexOf(type);
    const idx = data.publications.findIndex((x) => order.indexOf(x.type) > rank);
    return idx < 0 ? data.publications.length : idx;
  }

  /* ---------- DOI autofill (Crossref) ---------- */
  function normalizeDoi(s) {
    return String(s || "").trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i, "").replace(/^doi:\s*/i, "");
  }

  function initials(given) {
    return String(given || "").split(/[\s.]+/).filter(Boolean)
      .map((part) => part.split("-").map((x) => x[0].toUpperCase() + ".").join("-")).join(" ");
  }

  function joinAuthors(list) {
    if (list.length <= 1) return list.join("");
    return list.slice(0, -1).join(", ") + ", & " + list[list.length - 1];
  }

  const stripTags = (s) => String(s || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

  async function fetchDoi() {
    const doi = normalizeDoi($("f-doi").value);
    if (!doi) return msg("form-msg", "Enter a DOI first.", "err");
    $("doi-btn").disabled = true;
    msg("form-msg", "Looking up the DOI on Crossref…");
    try {
      const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
      if (!res.ok) throw new Error(res.status === 404 ? "DOI not found on Crossref." : `Crossref error ${res.status}.`);
      const m = (await res.json()).message;
      const meMatch = String(data.meMatch || "").toLowerCase();
      const authors = (m.author || []).map((a) => {
        const full = `${a.given || ""} ${a.family || ""} ${a.name || ""}`.toLowerCase();
        if (meMatch && data.me && full.includes(meMatch)) return data.me; // Crossref often splits "Md. Awlad Hossain" oddly
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
      if (editingIndex < 0) $("f-id").dataset.auto = "1";
      updatePreview();
      const mine = data.me && $("f-authors").value.includes(data.me);
      msg("form-msg", "Filled from Crossref. Please check the details" +
        (mine ? "." : ` — your name was not found as “${esc(data.me)}”, so edit the author list to match it exactly if you want it bolded.`), mine ? "ok" : "info");
    } catch (err) {
      msg("form-msg", esc(err.message), "err");
    } finally {
      $("doi-btn").disabled = false;
    }
  }

  /* ---------- publish ---------- */
  async function publish() {
    const btn = $("publish-btn");
    btn.disabled = true;
    msg("editor-msg", "Publishing to GitHub…");
    const text = JSON.stringify(data, null, 2) + "\n";
    const summary = changes.length === 1 ? changes[0] : `Update publications (${changes.length} changes)`;
    try {
      const res = await gh(`/contents/${DATA_PATH}`, {
        method: "PUT",
        body: JSON.stringify({
          message: `${summary}\n\n${changes.map((c) => `- ${c}`).join("\n")}\n\nVia the site admin page.`,
          content: utf8ToB64(text),
          sha,
          branch: REPO.branch,
        }),
      });
      sha = res.content.sha;
      original = text;
      changes = [];
      renderList();
      msg("editor-msg", `Published. The live site will update in about a minute. <a href="${res.commit.html_url}" target="_blank" rel="noopener">View commit</a>`, "ok");
    } catch (err) {
      msg("editor-msg", explain(err), "err");
    } finally {
      btn.disabled = false;
    }
  }

  async function refreshYoutube() {
    const btn = $("yt-btn");
    btn.disabled = true;
    try {
      await gh(`/actions/workflows/${WORKFLOW}/dispatches`, { method: "POST", body: JSON.stringify({ ref: REPO.branch }) });
      msg("editor-msg", "YouTube refresh started. New videos and view counts appear on the site in 1–2 minutes.", "ok");
    } catch (err) {
      msg("editor-msg", err.status === 403 || err.status === 404
        ? "Could not start the YouTube refresh. Give the token <code>Actions: Read and write</code> permission. (It refreshes automatically every day anyway.)"
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

  /* ---------- wiring ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    if (!window.crypto || !crypto.subtle) {
      document.body.innerHTML = '<p style="padding:32px">This page needs a secure (https) connection.</p>';
      return;
    }
    $("f-type").innerHTML = TYPES.map((t) => `<option value="${t.key}">${t.label}</option>`).join("");
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
        await fetchData(tok);
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
      if (changes.length && !confirm("You have unpublished changes. Lock anyway and lose them?")) return;
      token = null; data = null; changes = [];
      closeForm();
      show("view-lock");
    });
    $("forget-btn").addEventListener("click", forget);
    $("forget-btn-lock").addEventListener("click", forget);

    $("add-btn").addEventListener("click", () => openForm(-1));
    $("cancel-btn").addEventListener("click", closeForm);
    $("save-btn").addEventListener("click", saveForm);
    $("doi-btn").addEventListener("click", fetchDoi);
    $("f-doi").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); fetchDoi(); } });
    $("f-id").addEventListener("input", () => { $("f-id").dataset.auto = "0"; });
    FIELDS.concat("corr").forEach((f) => $(`f-${f}`).addEventListener("input", updatePreview));
    $("f-corr").addEventListener("change", updatePreview);

    $("pub-rows").addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-act]");
      if (!btn) return;
      const i = Number(btn.dataset.i);
      const act = btn.dataset.act;
      if (act === "up") move(i, -1);
      else if (act === "down") move(i, 1);
      else if (act === "edit") openForm(i);
      else if (act === "del" && confirm(`Delete “${data.publications[i].title}”?`)) {
        changes.push(`Delete “${short(data.publications[i].title)}”`);
        data.publications.splice(i, 1);
        if (editingIndex === i) closeForm();
        renderList();
      }
    });

    $("publish-btn").addEventListener("click", publish);
    $("discard-btn").addEventListener("click", () => {
      if (!confirm("Discard all unpublished changes?")) return;
      data = JSON.parse(original);
      changes = [];
      closeForm();
      renderList();
      clearMsg("editor-msg");
    });
    $("yt-btn").addEventListener("click", refreshYoutube);

    window.addEventListener("beforeunload", (e) => {
      if (changes.length) { e.preventDefault(); e.returnValue = ""; }
    });
  });
})();
