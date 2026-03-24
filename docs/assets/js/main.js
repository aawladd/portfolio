function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function areaCard(item) {
  return `
    <article class="content-card reveal">
      <div class="card-kicker">${escapeHtml(item.kicker || 'Research area')}</div>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.text)}</p>
      ${item.metrics ? `
        <div class="card-metrics">
          ${item.metrics.map(metric => `
            <div class="card-metric">
              <strong>${escapeHtml(metric.label)}</strong>
              <span class="micro-copy">${escapeHtml(metric.value)}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </article>
  `;
}

function projectCard(project) {
  const tags = (project.tags || []).map(tag => `<span>${escapeHtml(tag)}</span>`).join('');
  const links = (project.links || []).map(link => `<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener">${escapeHtml(link.label)}</a>`).join('');
  return `
    <article class="project-card reveal" data-category="${escapeHtml(project.category)}">
      <div class="project-top">
        <span class="pill gold">${escapeHtml(project.category)}</span>
        <span class="status-dot ${project.statusTone === 'draft' ? 'draft' : ''}">${escapeHtml(project.status)}</span>
      </div>
      <h3>${escapeHtml(project.title)}</h3>
      <p>${escapeHtml(project.text)}</p>
      <div class="card-metrics">
        <div class="card-metric">
          <strong>Focus</strong>
          <span class="micro-copy">${escapeHtml(project.focus)}</span>
        </div>
        <div class="card-metric">
          <strong>Mode</strong>
          <span class="micro-copy">${escapeHtml(project.mode)}</span>
        </div>
      </div>
      <div class="tag-list">${tags}</div>
      ${links ? `<div class="card-links">${links}</div>` : ''}
      <div class="project-accent"></div>
    </article>
  `;
}

function publicationCard(pub) {
  const links = (pub.links || []).map(link => `<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener">${escapeHtml(link.label)}</a>`).join('');
  return `
    <article class="publication-card reveal">
      <div class="pub-top">
        <span class="pill subtle">${escapeHtml(pub.year)}</span>
        <span class="status-dot ${pub.statusTone === 'draft' ? 'draft' : ''}">${escapeHtml(pub.status)}</span>
      </div>
      <h3>${escapeHtml(pub.title)}</h3>
      <p><strong>${escapeHtml(pub.authors)}</strong></p>
      <p>${escapeHtml(pub.venue)}</p>
      <p>${escapeHtml(pub.note)}</p>
      ${links ? `<div class="card-links">${links}</div>` : ''}
      <div class="pub-accent"></div>
    </article>
  `;
}

function simpleCard(item, label) {
  const links = item.url ? `<div class="card-links"><a href="${escapeHtml(item.url)}" target="_blank" rel="noopener">Open</a></div>` : '';
  return `
    <article class="showcase-card reveal">
      <div class="card-kicker">${escapeHtml(label)}</div>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.text)}</p>
      ${links}
    </article>
  `;
}

function contactCard(link) {
  return `
    <a class="contact-link" href="${escapeHtml(link.url)}" ${link.url.startsWith('#') ? '' : 'target="_blank" rel="noopener"'}>
      <span>${escapeHtml(link.label)}</span>
      <span>${escapeHtml(link.value)}</span>
    </a>
  `;
}

$(function () {
  if (typeof siteData !== 'undefined') {
    $("[data-profile='name']").text(siteData.profile.name);
    $("[data-profile='title']").text(siteData.profile.title);
    $("[data-profile='subtitle']").text(siteData.profile.subtitle);
    $("[data-profile='tagline']").text(siteData.profile.tagline);
    $("[data-profile='email']").text(siteData.profile.email);
    $("[data-profile='email-link']").attr('href', `mailto:${siteData.profile.email}`).text(siteData.profile.email);
    $("[data-profile='cv-link']").attr('href', siteData.profile.cvFile);
    $("[data-profile='youtube-link']").attr('href', siteData.profile.youtubeUrl);

    if ($('#role-pills').length) {
      $('#role-pills').html(siteData.profile.roles.map(role => `<span>${escapeHtml(role)}</span>`).join(''));
    }

    if ($('#hero-stats').length) {
      $('#hero-stats').html(siteData.highlights.map(item => `
        <div class="metric-card reveal">
          <span class="metric-value">${escapeHtml(item.value)}</span>
          <span class="metric-label">${escapeHtml(item.label)}</span>
        </div>
      `).join(''));
    }

    if ($('#home-research-grid').length) {
      $('#home-research-grid').html(siteData.researchAreas.slice(0, 6).map(areaCard).join(''));
    }

    if ($('#research-page-grid').length) {
      $('#research-page-grid').html(siteData.researchAreas.map(areaCard).join(''));
    }

    if ($('#featured-projects').length) {
      $('#featured-projects').html(siteData.projects.filter(p => p.featured).map(projectCard).join(''));
    }

    if ($('#project-grid').length) {
      $('#project-grid').html(siteData.projects.map(projectCard).join(''));
    }

    if ($('#publication-list').length) {
      $('#publication-list').html(siteData.publications.map(publicationCard).join(''));
    }

    if ($('#teaching-courses').length) {
      $('#teaching-courses').html(siteData.courses.map(item => simpleCard(item, item.kicker || 'Course area')).join(''));
    }

    if ($('#video-grid').length) {
      $('#video-grid').html(siteData.videos.map(item => simpleCard(item, item.type)).join(''));
    }

    if ($('#blog-grid').length) {
      $('#blog-grid').html(siteData.blogs.map(item => simpleCard(item, item.date)).join(''));
    }

    if ($('#contact-links').length) {
      $('#contact-links').html(siteData.contactLinks.map(contactCard).join(''));
    }
  }

  $(document).on('click', '.filter-btn', function () {
    const filter = $(this).data('filter');
    $('.filter-btn').removeClass('active');
    $(this).addClass('active');

    if (filter === 'all') {
      $('.project-card').show();
    } else {
      $('.project-card').hide();
      $(`.project-card[data-category='${filter}']`).show();
    }
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
  }
});
