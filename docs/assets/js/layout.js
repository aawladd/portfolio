$(function () {
  const page = $("body").data("page");

  const nav = `
    <header class="site-header">
      <div class="container nav-wrap">
        <a class="brand" href="index.html">
          <span class="brand-mark">MAH</span>
          <span class="brand-text">
            <strong>Md Awlad Hossain</strong>
            <small>Researcher • Academic Teacher</small>
          </span>
        </a>

        <button class="nav-toggle" aria-label="Open navigation">☰</button>

        <nav class="site-nav">
          <a href="index.html" class="${page === 'home' ? 'active' : ''}">Home</a>
          <a href="research.html" class="${page === 'research' ? 'active' : ''}">Research</a>
          <a href="publications.html" class="${page === 'publications' ? 'active' : ''}">Publications</a>
          <a href="projects.html" class="${page === 'projects' ? 'active' : ''}">Projects</a>
          <a href="teaching.html" class="${page === 'teaching' ? 'active' : ''}">Teaching</a>
          <a href="youtube.html" class="${page === 'youtube' ? 'active' : ''}">Research Notes</a>
          <a href="contact.html" class="${page === 'contact' ? 'active' : ''}">Contact</a>
        </nav>
      </div>
    </header>
  `;

  const footer = `
    <footer class="site-footer">
      <div class="container footer-grid">
        <div>
          <h3>Md Awlad Hossain</h3>
          <p>A research-centered academic website for presenting scholarly work, teaching, projects, publications, and technical communication in one coherent profile.</p>
        </div>
        <div>
          <h4>Research</h4>
          <ul>
            <li><a href="research.html">Research Agenda</a></li>
            <li><a href="projects.html">Research Projects</a></li>
            <li><a href="publications.html">Publications</a></li>
          </ul>
        </div>
        <div>
          <h4>Academic Profile</h4>
          <ul>
            <li><a href="teaching.html">Teaching</a></li>
            <li><a href="youtube.html">Research Notes</a></li>
            <li><a href="contact.html">Contact & Links</a></li>
          </ul>
        </div>
      </div>
      <div class="container footer-bottom">
        <p>© <span id="current-year"></span> Md Awlad Hossain • Built for GitHub Pages.</p>
      </div>
    </footer>
  `;

  $("#site-header").html(nav);
  $("#site-footer").html(footer);
  $("#current-year").text(new Date().getFullYear());

  $(document).on("click", ".nav-toggle", function () {
    $(".site-nav").toggleClass("open");
  });

  $(document).on("click", ".site-nav a", function () {
    $(".site-nav").removeClass("open");
  });
});
