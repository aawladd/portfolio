/* Research-project admin.
   Publications and videos update automatically; only docs/assets/data/projects.json is edited here.
   The GitHub token is encrypted (AES-GCM, key from PBKDF2-SHA256 of your password) and kept only
   in this browser's localStorage. Unlocked, it lives in memory until the page is closed or locked. */
(function () {
  const REPO = { owner: "aawladd", name: "portfolio", branch: "main" };
  const PATH = "docs/assets/data/projects.json";
  const STORE_KEY = "siteAdmin.v1";
  const PBKDF2_ITERATIONS = 310000;

  const { esc, withKeys } = window.Pubs;
  const $ = (id) => document.getElementById(id);
  const enc = new TextEncoder();
  const dec = new TextDecoder();

  let token = null;
  let data = null;      // { projects: [...] }
  let sha = null;
  let original = "";
  let changes = [];
  let pubData = null;   // public publications.json, for citation keys
  let editingIndex = -1;
  let lastText = null;

  /* ---------- helpers ---------- */
  function msg(id, text, kind = "info") {
    const el = $(id);
    el.className = `msg show ${kind}`;
    el.innerHTML = text;
  }
  const clearMsg = (id) => { $(id).className = "msg"; };
  const short = (t) => (String(t).length > 50 ? String(t).slice(0, 48) + "…" : String(t));
  const serialize = (d) => JSON.stringify(d, null, 2) + "\n";
  const isDirty = () => data && serialize(data) !== original;
  const cleanId = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
  function slugify(text) {
    return text.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase()
      .replace(/[^a-z0-9]+/g, " ").trim().split(" ").filter((w) => w.length > 2).slice(0, 6).join("-") || "project";
  }
  function uniqueId(base, skipIndex) {
    const taken = new Set(data.projects.filter((_, i) => i !== skipIndex).map((x) => x.id));
    let id = base, n = 2;
    while (taken.has(id)) id = `${base}-${n++}`;
    return id;
  }
  const keys = () => Projects.keyMap(pubData);
  const ORDER = Projects.STATUS.map((s) => s.key);
  function insertionPoint(status) {
    const first = data.projects.findIndex((x) => x.status === status);
    if (first >= 0) return first;
    const idx = data.projects.findIndex((x) => ORDER.indexOf(x.status) > ORDER.indexOf(status));
    return idx < 0 ? data.projects.length : idx;
  }

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

  /* ---------- GitHub ---------- */
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

  const getFile = (tok = token) => gh(`/contents/${PATH}?ref=${REPO.branch}&t=${Date.now()}`, {}, tok);

  function explain(err) {
    if (err.status === 401) return "GitHub rejected the token (expired or revoked). Use “Forget this device” and set up a new token.";
    if (err.status === 403) return "The token lacks permission. It needs Contents: Read and write on aawladd/portfolio.";
    if (err.status === 404) return "Not found. Check that the token has access to the aawladd/portfolio repository.";
    if (err.status === 409 || err.status === 422) return "The projects file changed on GitHub since this page loaded. Reload the page and redo your edit.";
    return esc(err.message || String(err));
  }

  /* ---------- views ---------- */
  function show(view) {
    ["view-setup", "view-lock", "view-editor"].forEach((v) => { $(v).hidden = v !== view; });
    if (view === "view-lock") setTimeout(() => $("lock-pw").focus(), 0);
  }

  async function openEditor() {
    show("view-editor");
    msg("editor-msg", "Loading projects…");
    try {
      const [file, pubs] = await Promise.all([getFile(), Pubs.load().catch(() => null)]);
      sha = file.sha;
      original = b64ToUtf8(file.content);
      data = JSON.parse(original);
      pubData = pubs;
      changes = [];
      clearMsg("editor-msg");
      closeForm();
      render();
    } catch (err) {
      msg("editor-msg", explain(err), "err");
    }
  }

  function render() {
    const k = keys();
    $("project-rows").innerHTML = Projects.STATUS.map((s) => {
      const items = data.projects.map((p, i) => ({ p, i })).filter(({ p }) => p.status === s.key);
      const other = s.key === "current" ? "Move to past" : "Move to current";
      return `<div class="group-title">${s.label}</div>` + (items.length ? items.map(({ p, i }, n) => `
        <div class="item-row">
          <div><div class="t">${esc(p.title)}</div><div class="v">${[p.dates ? esc(p.dates) : "", p.where ? Projects.richText(p.where, k) : ""].filter(Boolean).join(" · ")}</div></div>
          <div class="ctl">
            <button class="b sm" data-act="up" data-i="${i}" ${n === 0 ? "disabled" : ""} aria-label="Move up">↑</button>
            <button class="b sm" data-act="down" data-i="${i}" ${n === items.length - 1 ? "disabled" : ""} aria-label="Move down">↓</button>
            <button class="b sm" data-act="toggle" data-i="${i}">${other}</button>
            <button class="b sm" data-act="edit" data-i="${i}">Edit</button>
            <button class="b sm danger" data-act="del" data-i="${i}">Remove</button>
          </div>
        </div>`).join("") : '<p class="note" style="padding: 8px 0">None yet.</p>');
    }).join("");

    $("p-cite").innerHTML = '<option value="">Cite one of your publications…</option>' +
      withKeys((pubData && pubData.publications) || []).map((p) => `<option value="${esc(p.id)}">[${p.key}] ${esc(short(p.title))}</option>`).join("");

    $("dirty-bar").classList.toggle("show", isDirty());
    $("dirty-list").textContent = changes.slice(-3).join("; ") + (changes.length > 3 ? ` (+${changes.length - 3} more)` : "");
  }

  /* ---------- form ---------- */
  const FIELDS = ["title", "status", "dates", "where", "summary", "bullets", "link", "id"];

  function readForm() {
    const v = {};
    FIELDS.forEach((f) => { v[f] = $(`p-${f}`).value.trim(); });
    return {
      id: v.id, status: v.status, title: v.title, dates: v.dates, where: v.where, summary: v.summary,
      bullets: v.bullets.split("\n").map((x) => x.trim()).filter(Boolean), link: v.link,
    };
  }
  function fillForm(p) {
    FIELDS.forEach((f) => { $(`p-${f}`).value = f === "bullets" ? (p.bullets || []).join("\n") : p[f] || ""; });
    $("p-status").value = p.status || "current";
    $("p-id").dataset.auto = p.id ? "0" : "1";
    updatePreview();
  }
  function updatePreview() {
    const p = readForm();
    if ($("p-id").dataset.auto === "1" && p.title) $("p-id").value = uniqueId(slugify(p.title), editingIndex);
    $("p-preview").innerHTML = p.title ? Projects.projectHTML(p, keys()) : '<span class="muted">Fill in the fields to see the project.</span>';
  }
  function openForm(index) {
    editingIndex = index;
    $("form-title").textContent = index < 0 ? "Add project" : "Edit project";
    fillForm(index < 0 ? { status: "current" } : data.projects[index]);
    clearMsg("form-msg");
    $("form-panel").hidden = false;
    $("form-panel").scrollIntoView({ behavior: "smooth", block: "start" });
    $("p-title").focus({ preventScroll: true });
  }
  function closeForm() {
    $("form-panel").hidden = true;
    editingIndex = -1;
  }
  function saveForm() {
    const p = readForm();
    if (!p.title) return msg("form-msg", "Please enter a title.", "err");
    if (!p.summary && !p.bullets.length) return msg("form-msg", "Please add a description or at least one key point.", "err");
    if (p.link && !/^https?:\/\//i.test(p.link)) return msg("form-msg", "The link must start with http:// or https://.", "err");
    p.id = uniqueId(cleanId(p.id) || slugify(p.title), editingIndex);
    if (editingIndex < 0) {
      data.projects.splice(insertionPoint(p.status), 0, p);
      changes.push(`Add project “${short(p.title)}”`);
    } else {
      if (data.projects[editingIndex].status !== p.status) {
        data.projects.splice(editingIndex, 1);
        data.projects.splice(insertionPoint(p.status), 0, p);
      } else {
        data.projects[editingIndex] = p;
      }
      changes.push(`Edit project “${short(p.title)}”`);
    }
    closeForm();
    render();
    msg("editor-msg", "Saved to the list. Press <strong>Publish to website</strong> when you are done.", "ok");
  }
  function insertCitation() {
    const id = $("p-cite").value;
    if (!id) return;
    const el = lastText || $("p-summary");
    const at = el.selectionStart ?? el.value.length;
    el.value = el.value.slice(0, at).replace(/\s+$/, "") + ` {pub:${id}}` + el.value.slice(el.selectionEnd ?? at);
    el.focus();
    $("p-cite").value = "";
    updatePreview();
  }

  /* ---------- publish ---------- */
  async function publish() {
    const btn = $("publish-btn");
    btn.disabled = true;
    msg("editor-msg", "Publishing…");
    const text = serialize(data);
    const summary = changes.length === 1 ? changes[0] : `Update research projects (${changes.length} changes)`;
    try {
      const res = await gh(`/contents/${PATH}`, {
        method: "PUT",
        body: JSON.stringify({
          message: `${summary}\n\n${changes.map((c) => `- ${c}`).join("\n")}\n\nVia the project admin page.`,
          content: utf8ToB64(text),
          sha,
          branch: REPO.branch,
        }),
      });
      sha = res.content.sha;
      original = text;
      changes = [];
      render();
      msg("editor-msg", "Published. The research page updates in about a minute.", "ok");
    } catch (err) {
      msg("editor-msg", explain(err), "err");
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
        await getFile(tok);
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
      if (isDirty() && !confirm("You have unpublished changes. Lock anyway and lose them?")) return;
      token = null; data = null; changes = [];
      show("view-lock");
    });
    $("forget-btn").addEventListener("click", forget);
    $("forget-btn-lock").addEventListener("click", forget);

    $("add-btn").addEventListener("click", () => openForm(-1));
    $("cancel-btn").addEventListener("click", closeForm);
    $("save-btn").addEventListener("click", saveForm);
    $("p-cite-btn").addEventListener("click", insertCitation);
    $("p-id").addEventListener("input", () => { $("p-id").dataset.auto = "0"; });
    FIELDS.forEach((f) => $(`p-${f}`).addEventListener("input", updatePreview));
    ["p-summary", "p-bullets", "p-where"].forEach((id) => $(id).addEventListener("focus", () => { lastText = $(id); }));

    $("project-rows").addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-act]");
      if (!btn) return;
      const i = Number(btn.dataset.i);
      const p = data.projects[i];
      const act = btn.dataset.act;
      if (act === "edit") return openForm(i);
      if (act === "del") {
        if (!confirm(`Remove the project “${p.title}”?`)) return;
        data.projects.splice(i, 1);
        changes.push(`Remove project “${short(p.title)}”`);
        if (editingIndex === i) closeForm();
      } else if (act === "toggle") {
        const status = p.status === "current" ? "past" : "current";
        data.projects.splice(i, 1);
        data.projects.splice(insertionPoint(status), 0, { ...p, status });
        changes.push(`Move “${short(p.title)}” to ${status}`);
      } else {
        const dir = act === "up" ? -1 : 1;
        let j = i + dir;
        while (j >= 0 && j < data.projects.length && data.projects[j].status !== p.status) j += dir;
        if (j < 0 || j >= data.projects.length) return;
        [data.projects[i], data.projects[j]] = [data.projects[j], data.projects[i]];
        changes.push(`Reorder “${short(p.title)}”`);
      }
      render();
    });

    $("publish-btn").addEventListener("click", publish);
    $("discard-btn").addEventListener("click", () => {
      if (!confirm("Discard all unpublished changes?")) return;
      data = JSON.parse(original);
      changes = [];
      closeForm();
      render();
      clearMsg("editor-msg");
    });

    window.addEventListener("beforeunload", (e) => {
      if (isDirty()) { e.preventDefault(); e.returnValue = ""; }
    });
  });
})();
