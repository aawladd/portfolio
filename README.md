# Md. Awlad Hossain — Academic Website

Live site: **https://aawladd.github.io/portfolio/**

Static site served by GitHub Pages from the `docs/` folder. There is no build step.

| Page | File | Content source |
| --- | --- | --- |
| About | `docs/index.html` | HTML + recent publications and top videos from data |
| Research | `docs/research.html` | HTML + projects from `docs/assets/data/projects.json` |
| Publications | `docs/publications.html` | `docs/assets/data/publications.json` |
| Teaching | `docs/teaching.html` | HTML |
| Videos | `docs/youtube.html` | `docs/assets/data/youtube.json` |
| Contact | `docs/contact.html` | HTML |
| CV | `docs/assets/files/Md_Awlad_Hossain_CV.pdf` | replace the PDF, keep the file name |

## Admin page (publications and projects)

The admin page is a hidden HTML file in `docs/`. It is not linked from the site and is marked `noindex`.
Its address is deliberately not written here. Note that the repository is public, so the file name can be seen
by anyone who browses the code. The real protection is the password and the GitHub token, not the hidden address.

1. **First time on a device:** create a [fine-grained GitHub token](https://github.com/settings/personal-access-tokens/new)
   with *Repository access → Only select repositories → aawladd/portfolio* and these permissions:
   *Contents: Read and write* and *Actions: Read and write* (for the “Sync” and “Refresh YouTube” buttons).
   Paste the token, choose a password, and save. The token is encrypted with your password (AES-GCM, PBKDF2)
   and stored only in that browser.
2. **After that:** enter only your password.
3. **Publications tab:** add a paper by DOI (details are filled from Crossref). You can also edit, delete and reorder
   papers, change a paper's type when it is accepted, and approve or ignore papers that the Scholar sync found but
   could not match.
4. **Projects tab:** add, edit, remove and reorder projects, and move them between *Current Research* and *Past Projects*.
   “Insert citation” adds `{pub:id}`, which shows as [J1], [U2] and so on and stays correct when the numbering changes.
5. Press **Publish to website**. This commits the data files, and the site updates in about a minute.

If a device is lost, revoke the token on GitHub.

## Publication sync (Google Scholar + ORCID)

`.github/workflows/publications.yml` runs weekly (and from the admin “Sync” button):

- **ORCID** (reliable, public API): a new DOI is added automatically with clean metadata from Crossref. A
  manuscript under review whose title matches a published work is promoted with its DOI, journal and volume.
- **Google Scholar** (no official API): updates per-paper citation counts and the citations, h-index and
  i10-index totals. Scholar papers that cannot be matched are queued for approval on the admin page. Scholar sometimes
  blocks automated requests; when that happens, that week's citation update is skipped and nothing breaks.
- Papers deleted or ignored on the admin page are remembered and never re-added.

Keep your ORCID record up to date (ORCID can import from Crossref automatically), because that is how new papers arrive.

## YouTube videos

`.github/workflows/youtube.yml` runs daily (and on demand) and writes `docs/assets/data/youtube.json`.
The site ranks videos by `views / (age in days + 14)^0.8`, which balances popularity and recency. Visitors can
also sort by most viewed or latest.

Without configuration the workflow reads the channel's public feed, which covers the **latest 15 uploads**.
To include every video, add a YouTube Data API v3 key as a repository secret named `YOUTUBE_API_KEY`
(*Settings → Secrets and variables → Actions*).

Because the workflow and the admin page commit to `main`, run `git pull` before editing files locally.
