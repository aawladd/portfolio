"""Sync docs/assets/data/publications.json with Google Scholar and ORCID.

- Google Scholar: citation counts per paper and profile metrics (citations, h-index, i10-index).
- ORCID: works with DOIs. A new DOI is added using clean metadata from Crossref; a work whose title
  matches an existing "under review"/"preprint" entry promotes that entry (adds DOI, journal, volume).
- Scholar papers that cannot be matched to a DOI are put in "pending" for approval on the admin page.
- Anything deleted or ignored on the admin page is listed in "ignore" and never re-added.

Each source is optional: if Scholar blocks the request, ORCID still runs (and vice versa).
Standard library only.
"""

import datetime as dt
import difflib
import html
import json
import os
import re
import sys
import urllib.parse
import urllib.request

SCHOLAR_ID = "klpg31MAAAAJ"
ORCID_ID = "0009-0008-6017-0948"
PATH = os.path.join(os.path.dirname(__file__), "..", "..", "docs", "assets", "data", "publications.json")
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
TYPE_ORDER = ["journal", "conference", "chapter", "review", "preprint"]
TYPE_MAP = {
    "journal-article": "journal", "proceedings-article": "conference", "conference-paper": "conference",
    "book-chapter": "chapter", "posted-content": "preprint", "preprint": "preprint",
}


def get(url, accept=None, ua=UA):
    headers = {"User-Agent": ua}
    if accept:
        headers["Accept"] = accept
    with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=30) as r:
        return r.read().decode("utf-8")


def norm(text):
    return re.sub(r"[^a-z0-9]", "", html.unescape(text or "").lower())


def same_title(a, b):
    a, b = norm(a), norm(b)
    if not a or not b:
        return False
    if a == b or (min(len(a), len(b)) > 40 and (a.startswith(b) or b.startswith(a))):
        return True
    return difflib.SequenceMatcher(None, a, b).ratio() > 0.92


def strip_tags(text):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", html.unescape(text or ""))).strip()


def slugify(title):
    words = [w for w in re.sub(r"[^a-z0-9]+", " ", title.lower()).split() if len(w) > 2]
    return "-".join(words[:6]) or "publication"


# ---------------------------------------------------------------- sources

def scholar():
    page = get(f"https://scholar.google.com/citations?user={SCHOLAR_ID}&hl=en&cstart=0&pagesize=100&sortby=pubdate")
    if 'id="gsc_rsb_st"' not in page:
        raise RuntimeError("Scholar returned an unexpected page (probably a CAPTCHA).")
    stats = [int(x) for x in re.findall(r'class="gsc_rsb_std">(\d+)<', page)]
    metrics = {"citations": stats[0], "hIndex": stats[2], "i10": stats[4]} if len(stats) >= 6 else None
    papers = []
    for row in re.findall(r'<tr class="gsc_a_tr">(.*?)</tr>', page, re.S):
        title = re.search(r'class="gsc_a_at">(.*?)</a>', row, re.S)
        link = re.search(r'href="(/citations\?view_op=view_citation[^"]+)"', row)
        grays = re.findall(r'<div class="gs_gray">(.*?)</div>', row, re.S)
        cites = re.search(r'class="gsc_a_ac[^"]*">(\d*)</a>', row)
        year = re.search(r'class="gsc_a_h gsc_a_hc gs_ibl">(\d{4})<', row)
        if not title:
            continue
        papers.append({
            "title": strip_tags(title.group(1)),
            "authors": strip_tags(grays[0]) if grays else "",
            "venue": strip_tags(re.sub(r'<span class="gs_oph">.*?</span>', "", grays[1])) if len(grays) > 1 else "",
            "year": year.group(1) if year else "",
            "citations": int(cites.group(1)) if cites and cites.group(1) else 0,
            "url": "https://scholar.google.com" + html.unescape(link.group(1)) if link else "",
        })
    return metrics, papers


def orcid():
    data = json.loads(get(f"https://pub.orcid.org/v3.0/{ORCID_ID}/works", accept="application/json"))
    works = []
    for group in data.get("group", []):
        s = group["work-summary"][0]
        dois = [e["external-id-value"] for e in (s.get("external-ids") or {}).get("external-id", [])
                if e["external-id-type"] == "doi"]
        works.append({"title": s["title"]["title"]["value"], "doi": dois[0].lower() if dois else "",
                      "type": TYPE_MAP.get(s.get("type"), "")})
    return works


def initials(given):
    parts = [p for p in re.split(r"[\s.]+", given or "") if p]
    return " ".join("-".join(x[0].upper() + "." for x in p.split("-") if x) for p in parts)


def join_authors(names):
    return names[0] if len(names) == 1 else ", ".join(names[:-1]) + ", & " + names[-1]


def crossref(doi, me, me_match):
    m = json.loads(get(f"https://api.crossref.org/works/{urllib.parse.quote(doi)}",
                       ua="portfolio-publication-sync (https://aawladd.github.io/portfolio/)"))["message"]
    authors = []
    for a in m.get("author", []):
        full = f"{a.get('given', '')} {a.get('family', '')} {a.get('name', '')}".lower()
        if me_match and me_match in full:
            authors.append(me)
        elif a.get("family"):
            authors.append(f"{a['family']}, {initials(a.get('given'))}".rstrip(", "))
        elif a.get("name"):
            authors.append(a["name"])
    date = (m.get("published-print") or m.get("published-online") or m.get("published") or m.get("issued") or {})
    parts = (date.get("date-parts") or [[None]])[0]
    vol = f"{m['volume']}({m['issue']})" if m.get("volume") and m.get("issue") else m.get("volume", "")
    pages = m.get("page") or m.get("article-number") or ""
    return {
        "type": TYPE_MAP.get(m.get("type"), "journal"),
        "authors": join_authors(authors) if authors else "",
        "year": str(parts[0]) if parts and parts[0] else "",
        "title": strip_tags((m.get("title") or [""])[0]),
        "venue": strip_tags((m.get("container-title") or [""])[0]),
        "details": ", ".join(x for x in [vol, pages] if x),
        "doi": doi,
    }


# ---------------------------------------------------------------- merge

def insert_at(pubs, ptype):
    for i, p in enumerate(pubs):
        if p["type"] == ptype:
            return i
    rank = TYPE_ORDER.index(ptype) if ptype in TYPE_ORDER else 0
    for i, p in enumerate(pubs):
        if TYPE_ORDER.index(p["type"]) > rank:
            return i
    return len(pubs)


def main():
    with open(PATH, encoding="utf-8") as f:
        data = json.load(f)
    before = json.dumps(data, sort_keys=True)
    pubs = data["publications"]
    me, me_match = data.get("me", ""), data.get("meMatch", "")
    ignore = set(data.get("ignore", []))
    log = []

    def ignored(title, doi=""):
        return norm(title) in ignore or (doi and doi.lower() in ignore)

    def find(title="", doi=""):
        for p in pubs:
            if doi and p.get("doi", "").lower() == doi.lower():
                return p
        for p in pubs:
            if title and same_title(p["title"], title):
                return p
        return None

    def add_or_promote(doi, title):
        existing = find(title=title)
        meta = crossref(doi, me, me_match)
        if existing:  # e.g. an "under review" manuscript that is now published
            old_type = existing["type"]
            existing.update({k: v for k, v in meta.items() if v and k != "authors"})
            if meta["authors"] and me in meta["authors"]:
                existing["authors"] = meta["authors"]
            if existing["type"] != old_type:  # move to the top of its new section
                pubs.remove(existing)
                pubs.insert(insert_at(pubs, existing["type"]), existing)
            log.append(f"Promoted: {existing['title'][:70]}")
            return
        taken = {p["id"] for p in pubs}
        pid, n = slugify(meta["title"] or title), 2
        while pid in taken:
            pid, n = f"{slugify(meta['title'] or title)}-{n}", n + 1
        entry = {"id": pid, "type": meta["type"], "authors": meta["authors"], "corresponding": False,
                 "year": meta["year"], "title": meta["title"] or title, "venue": meta["venue"],
                 "details": meta["details"], "doi": doi, "url": "", "note": ""}
        pubs.insert(insert_at(pubs, entry["type"]), entry)
        log.append(f"Added: {entry['title'][:70]}")

    # ORCID: authoritative list of DOIs
    try:
        for w in orcid():
            if w["doi"] and not ignored(w["title"], w["doi"]) and not find(doi=w["doi"]):
                add_or_promote(w["doi"], w["title"])
    except Exception as e:  # noqa: BLE001
        print(f"ORCID skipped: {e}", file=sys.stderr)

    # Google Scholar: citations, metrics, and anything ORCID does not know about
    pending = []
    try:
        metrics, papers = scholar()
        if metrics:
            data["scholar"] = {**data.get("scholar", {}), **metrics,
                               "url": f"https://scholar.google.com/citations?user={SCHOLAR_ID}"}
        for sp in papers:
            p = find(title=sp["title"])
            if p:
                p["citations"] = sp["citations"]
                p["scholarUrl"] = sp["url"]
            elif not ignored(sp["title"]):
                pending.append(sp)
        data["pending"] = pending
    except Exception as e:  # noqa: BLE001
        print(f"Scholar skipped: {e}", file=sys.stderr)

    if json.dumps(data, sort_keys=True) == before:
        print("No changes.")
        return
    data.setdefault("scholar", {})["updated"] = dt.date.today().isoformat()
    with open(PATH, "w", encoding="utf-8", newline="\n") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print("\n".join(log) or "Updated citations/metrics.")
    if pending:
        print(f"{len(pending)} Scholar item(s) waiting for approval on the admin page.")


if __name__ == "__main__":
    main()
