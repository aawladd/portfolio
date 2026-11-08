# Md. Awlad Hossain — Academic Website

Live site: **https://aawladd.github.io/portfolio/**

Static site served by GitHub Pages from the `docs/` folder. There is no build step.

| Page | File | Content source |
| --- | --- | --- |
| About | `docs/index.html` | HTML + recent publications and top videos from data |
| Research | `docs/research.html` | HTML |
| Publications | `docs/publications.html` | `docs/assets/data/publications.json` |
| Teaching | `docs/teaching.html` | HTML |
| Videos | `docs/youtube.html` | `docs/assets/data/youtube.json` |
| Contact | `docs/contact.html` | HTML |
| CV | `docs/assets/files/Md_Awlad_Hossain_CV.pdf` | replace the PDF, keep the file name |

## Updating publications (admin page)

Open **https://aawladd.github.io/portfolio/admin.html** (not linked anywhere and marked `noindex`).

1. **First time on a device:** create a [fine-grained GitHub token](https://github.com/settings/personal-access-tokens/new)
   with *Repository access → Only select repositories → aawladd/portfolio* and these permissions:
   *Contents: Read and write*, plus *Actions: Read and write* if you want the “Refresh YouTube” button.
   Paste the token, choose a password, and save. The token is encrypted with your password (AES-GCM, PBKDF2)
   and stored only in that browser.
2. **After that:** enter only your password.
3. Use **+ Add publication**, paste a DOI and press **Fetch** to fill the details from Crossref, check them, then **Save to list**.
   You can also edit, delete and reorder entries. To move a paper from *Under review* to *Journal Articles* when it
   is accepted, change its type.
4. Press **Publish to website**. This commits `publications.json`, and the site updates in about a minute.

Security note: the password protects the token stored in your browser. The token is what actually grants write
access, so give it only this repository's permissions and set an expiry date. If a device is lost, revoke the
token on GitHub.

## YouTube videos

`.github/workflows/youtube.yml` runs daily (and on demand) and writes `docs/assets/data/youtube.json`.
The site ranks videos by `views / (age in days + 14)^0.8`, which balances popularity and recency. Visitors can
also sort by most viewed or latest.

Without configuration the workflow reads the channel's public feed, which covers the **latest 15 uploads**.
To include every video, add a YouTube Data API v3 key as a repository secret named `YOUTUBE_API_KEY`
(*Settings → Secrets and variables → Actions*).

Because the workflow and the admin page commit to `main`, run `git pull` before editing files locally.
