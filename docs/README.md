# Premium Dark Academic Website

A darker, more premium second version of your academic website designed for GitHub Pages.

## What changed in this version

- Dark, premium visual identity
- More polished academic/lab-style layout
- Better card/block system with stronger spacing and metadata
- Smoother reveal animations
- Exact jQuery CDN requested by you:
  `https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js`
- Easy content editing from `assets/js/site-data.js`

## Pages included

- `index.html` — homepage
- `research.html` — research vision and themes
- `publications.html` — publication list
- `teaching.html` — teaching and mentorship
- `projects.html` — projects with category filter
- `youtube.html` — YouTube and blog page
- `contact.html` — academic links and CV
- `404.html` — custom not found page

## Main files to edit

### 1) Change your profile content
Edit:
- `assets/js/site-data.js`

Update:
- name
- title
- subtitle
- email
- CV file path
- YouTube channel link
- publications
- projects
- blog posts
- video links
- academic profile links

### 2) Add your CV
Put your PDF inside:
- `assets/files/`

Then change this line in `assets/js/site-data.js`:
- `cvFile: "assets/files/replace-with-your-cv.pdf"`

### 3) Change colors or layout
Edit:
- `assets/css/style.css`

## GitHub Pages deployment

1. Create a new GitHub repository
2. Upload all files from this project
3. Commit and push
4. In GitHub repository settings, open **Pages**
5. Set the source to the main branch root folder
6. Save and wait for the site URL

## Good next upgrades

- Add your real profile image
- Add a Google Scholar button on the homepage
- Add publication filters by year/type
- Add a downloadable research statement PDF
- Add embedded YouTube thumbnails
- Add a simple blog post template folder later

## Notes

- This is a fully static site and works well with GitHub Pages
- No build tools are needed
- jQuery is included only for lightweight UI behavior and easy editing
