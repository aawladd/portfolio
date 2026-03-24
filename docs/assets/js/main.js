function cardTemplate(title, text, extra = "") {
  return `
    <article class="info-card reveal">
      <h3>${title}</h3>
      <p>${text}</p>
      ${extra}
    </article>
  `;
}

function projectCard(project) {
  const tagHtml = project.tags.map(tag => `<span>${tag}</span>`).join("");
  return `
    <article class="project-card reveal" data-category="${project.category}">
      <div class="project-top">
        <span class="pill">${project.category}</span>
        <span class="status">${project.status}</span>
      </div>
      <h3>${project.title}</h3>
      <p>${project.text}</p>
      <div class="tag-list">${tagHtml}</div>
    </article>
  `;
}

function publicationCard(pub) {
  const links = pub.links.map(link => `<a href="${link.url}">${link.label}</a>`).join("");
  return `
    <article class="publication-card reveal">
      <div class="publication-meta">
        <span>${pub.year}</span>
        <span>${pub.status}</span>
      </div>
      <h3>${pub.title}</h3>
      <p class="authors">${pub.authors}</p>
      <p class="venue">${pub.venue}</p>
      <p>${pub.note}</p>
      <div class="card-links">${links}</div>
    </article>
  `;
}

function simpleLinkCard(item, metaLabel) {
  return `
    <article class="info-card reveal">
      <span class="pill subtle">${metaLabel}</span>
      <h3>${item.title}</h3>
      <p>${item.text}</p>
      <div class="card-links">
        <a href="${item.url}">Open</a>
      </div>
    </article>
  `;
}

function blogCard(item) {
  return `
    <article class="info-card reveal">
      <span class="pill subtle">${item.date}</span>
      <h3>${item.title}</h3>
      <p>${item.text}</p>
      <div class="card-links">
        <a href="${item.url}">Read more</a>
      </div>
    </article>
  `;
}

$(function () {
  if (typeof siteData !== "undefined") {
    if ($("#home-research-grid").length) {
      $("#home-research-grid").html(siteData.researchAreas.map(item => cardTemplate(item.title, item.text)).join(""));
    }

    if ($("#research-page-grid").length) {
      $("#research-page-grid").html(siteData.researchAreas.map(item => cardTemplate(item.title, item.text)).join(""));
    }

    if ($("#featured-projects").length) {
      const featured = siteData.projects.filter(p => p.featured).slice(0, 3);
      $("#featured-projects").html(featured.map(projectCard).join(""));
    }

    if ($("#project-grid").length) {
      $("#project-grid").html(siteData.projects.map(projectCard).join(""));
    }

    if ($("#publication-list").length) {
      $("#publication-list").html(siteData.publications.map(publicationCard).join(""));
    }

    if ($("#teaching-courses").length) {
      $("#teaching-courses").html(siteData.courses.map(item => cardTemplate(item.title, item.text)).join(""));
    }

    if ($("#video-grid").length) {
      $("#video-grid").html(siteData.videos.map(item => simpleLinkCard(item, item.type)).join(""));
    }

    if ($("#blog-grid").length) {
      $("#blog-grid").html(siteData.blogs.map(blogCard).join(""));
    }
  }

  $(document).on("click", ".filter-btn", function () {
    const filter = $(this).data("filter");
    $(".filter-btn").removeClass("active");
    $(this).addClass("active");

    if (filter === "all") {
      $(".project-card").show();
    } else {
      $(".project-card").hide();
      $(`.project-card[data-category='${filter}']`).show();
    }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
});
