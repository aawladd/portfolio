# Md Awlad Hossain — Modular Academic Portfolio

A simple, professional, research-centered academic portfolio for GitHub Pages.

## Pages

- `index.html` — home and research identity
- `research.html` — research themes, questions, workflow, publications
- `projects.html` — filterable project archive
- `teaching.html` — teaching areas and mentoring approach
- `youtube.html` — technical communication and video slots
- `contact.html` — contact, profiles, CV links
- `404.html` — GitHub Pages not-found page

## Modular structure

```text
assets/
  css/
    variables.css   # colors, typography, spacing tokens
    base.css        # reset, body, typography basics
    layout.css      # header, grids, footer
    components.css  # cards, buttons, lists, filters
    pages.css       # page-specific styling
    responsive.css  # mobile and accessibility rules
    style.css       # imports all CSS modules
  js/
    site-data.js    # edit most website content here
    helpers.js      # helper utilities
    render.js       # page rendering functions
    main.js         # initialization, menu, animation
  img/
    profile.svg     # generated monogram avatar
  files/
    README.md       # place your CV here
```

## How to edit content

Most text, links, publications, projects, contact details, and teaching sections are controlled from:

```text
assets/js/site-data.js
```

Update placeholders for Google Scholar, ORCID, LinkedIn, real publications, and your real CV file.

## Deploy to GitHub Pages

1. Replace the old repository contents with this folder's contents.
2. Add your CV PDF to `assets/files/`.
3. Update the `profile.cv` path in `assets/js/site-data.js`.
4. Push to GitHub.
5. In repository settings, enable GitHub Pages from the main branch/root.

## Notes

- No build tool is required.
- Works as a static site on GitHub Pages.
- Uses modular CSS and vanilla JavaScript.
- Google Fonts are loaded from CDN.

## Latest refinement

The homepage and page headers were compacted to avoid oversized long text blocks. Headings are shorter, cards are lighter, and the layout is more suitable for an academic portfolio.
