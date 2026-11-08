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

## What updates automatically

| Content | Source | How often |
| --- | --- | --- |
| Publications, citation counts, h-index | ORCID + Google Scholar (+ Crossref for clean details) | weekly, `.github/workflows/publications.yml` |
| YouTube videos and view counts | YouTube channel feed | daily, `.github/workflows/youtube.yml` |
| Research projects | You, through the hidden project page | whenever you publish |

**Publications sync:** a new DOI on ORCID is added with full details from Crossref. A manuscript under review is
promoted automatically once it is published. Papers found only on Scholar are looked up on Crossref by title, and
if no DOI is found they are added using Scholar's own details. Scholar has no official API and sometimes blocks
automated requests; when that happens, only that week's citation update is skipped. To hide a paper permanently, add
its DOI (lower case) or its title (lower case, letters and digits only) to the `"ignore"` list in
`docs/assets/data/publications.json`. Keep your ORCID record current (it can import from Crossref automatically).

## Project page (hidden)

A hidden, `noindex` HTML page in `docs/` edits only `docs/assets/data/projects.json`: add, edit, remove, reorder,
and move projects between *Current Research* and *Past Projects*. Its address is not written here. The repository is
public, so the real protection is the password and the token, not the address.

- **First time on a device:** create a [fine-grained GitHub token](https://github.com/settings/personal-access-tokens/new)
  with access to only `aawladd/portfolio` and the permission *Contents: Read and write*. Then choose a password. The
  token is encrypted with your password and stored only in that browser.
- **After that:** enter only your password, edit, then press **Publish to website**.
- **Citations in projects:** “Insert citation” adds `{pub:id}`, which shows as [J1], [U2] and so on and stays correct
  when the numbering changes.

## YouTube videos

`.github/workflows/youtube.yml` runs daily (and on demand) and writes `docs/assets/data/youtube.json`.
The site ranks videos by `views / (age in days + 14)^0.8`, which balances popularity and recency. Visitors can
also sort by most viewed or latest.

Without configuration the workflow reads the channel's public feed, which covers the **latest 15 uploads**.
To include every video, add a YouTube Data API v3 key as a repository secret named `YOUTUBE_API_KEY`
(*Settings → Secrets and variables → Actions*).

Because the workflows and the project page commit to `main`, run `git pull` before editing files locally.
