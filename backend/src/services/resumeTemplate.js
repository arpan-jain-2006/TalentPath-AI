/**
 * @description Generates a high-precision, executive ATS-compliant HTML document from structured resume data.
 * Designed for 95%+ ATS parsing score (Greenhouse, Lever, Workday, Taleo).
 */
function renderAtsResumeHtml(data) {
  const {
    fullName = "Candidate",
    targetRole = "Software Engineer",
    contact = {},
    summary = "",
    skills = [],
    experience = [],
    projects = [],
    education = [],
    certifications = []
  } = data;

  const contactItems = [];
  if (contact.email) contactItems.push(contact.email);
  if (contact.phone) contactItems.push(contact.phone);
  if (contact.location) contactItems.push(contact.location);
  if (contact.linkedin) contactItems.push(contact.linkedin.replace(/^https?:\/\//, ''));
  if (contact.github) contactItems.push(contact.github.replace(/^https?:\/\//, ''));

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(fullName)} - ATS Resume</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm;
    }
    *, *::before, *::after {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1e293b;
      background: #ffffff;
      font-size: 9pt;
      line-height: 1.4;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .resume-wrapper {
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
    }
    /* Header */
    .header {
      text-align: center;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 8px;
      margin-bottom: 10px;
    }
    .candidate-name {
      font-size: 20pt;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.01em;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .candidate-role {
      font-size: 10.5pt;
      font-weight: 600;
      color: #2563eb;
      letter-spacing: 0.02em;
      margin-bottom: 5px;
    }
    .contact-line {
      font-size: 8.5pt;
      color: #475569;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
      gap: 6px;
    }
    .contact-item {
      display: inline-block;
    }
    .contact-sep {
      color: #94a3b8;
    }
    /* Section */
    .section {
      margin-bottom: 9px;
    }
    .section-title {
      font-size: 9.8pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #0f172a;
      border-bottom: 1.2px solid #cbd5e1;
      padding-bottom: 2px;
      margin-bottom: 5px;
    }
    .summary-text {
      font-size: 8.8pt;
      color: #334155;
      line-height: 1.45;
      text-align: justify;
    }
    /* Skills */
    .skills-grid {
      display: flex;
      flex-direction: column;
      gap: 2.5px;
    }
    .skill-line {
      font-size: 8.6pt;
      line-height: 1.35;
    }
    .skill-category {
      font-weight: 700;
      color: #0f172a;
      min-width: 140px;
      display: inline-block;
    }
    .skill-values {
      color: #334155;
    }
    /* Experience & Projects */
    .entry {
      margin-bottom: 7px;
    }
    .entry-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 2px;
    }
    .entry-title-wrap {
      font-size: 9.2pt;
    }
    .entry-bold {
      font-weight: 700;
      color: #0f172a;
    }
    .entry-subtitle {
      font-weight: 600;
      color: #2563eb;
    }
    .entry-meta {
      font-size: 8.3pt;
      font-weight: 600;
      color: #64748b;
      white-space: nowrap;
    }
    .bullets {
      list-style-type: disc;
      margin-left: 15px;
      padding-left: 0;
    }
    .bullets li {
      font-size: 8.6pt;
      color: #334155;
      line-height: 1.38;
      margin-bottom: 2px;
    }
    .bullets li strong {
      color: #0f172a;
    }
    /* Education & Certs */
    .edu-entry {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 8.8pt;
      margin-bottom: 3px;
    }
    .edu-degree {
      font-weight: 700;
      color: #0f172a;
    }
    .edu-inst {
      color: #475569;
    }
    .edu-year {
      font-size: 8.3pt;
      font-weight: 600;
      color: #64748b;
    }
    .cert-line {
      font-size: 8.6pt;
      color: #334155;
      margin-bottom: 2px;
    }
  </style>
</head>
<body>
  <div class="resume-wrapper">
    <!-- Header -->
    <header class="header">
      <h1 class="candidate-name">${escapeHtml(fullName)}</h1>
      <div class="candidate-role">${escapeHtml(targetRole)}</div>
      <div class="contact-line">
        ${contactItems.map((item, idx) => `
          <span class="contact-item">${escapeHtml(item)}</span>
          ${idx < contactItems.length - 1 ? '<span class="contact-sep">•</span>' : ''}
        `).join('')}
      </div>
    </header>

    <!-- Professional Summary -->
    ${summary ? `
    <section class="section">
      <h2 class="section-title">Professional Summary</h2>
      <p class="summary-text">${escapeHtml(summary)}</p>
    </section>
    ` : ''}

    <!-- Technical Skills -->
    ${skills && skills.length > 0 ? `
    <section class="section">
      <h2 class="section-title">Core Technical Competencies</h2>
      <div class="skills-grid">
        ${skills.map(s => `
          <div class="skill-line">
            <span class="skill-category">${escapeHtml(s.category)}:</span>
            <span class="skill-values">${escapeHtml((s.skillsList || []).join(', '))}</span>
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    <!-- Professional Experience -->
    ${experience && experience.length > 0 ? `
    <section class="section">
      <h2 class="section-title">Professional Experience</h2>
      ${experience.map(exp => `
        <div class="entry">
          <div class="entry-header">
            <div class="entry-title-wrap">
              <span class="entry-bold">${escapeHtml(exp.role)}</span>
              ${exp.company ? ` | <span class="entry-subtitle">${escapeHtml(exp.company)}</span>` : ''}
              ${exp.location ? ` - <em>${escapeHtml(exp.location)}</em>` : ''}
            </div>
            <div class="entry-meta">${escapeHtml(exp.duration || '')}</div>
          </div>
          <ul class="bullets">
            ${(exp.bullets || []).map(b => `<li>${formatMetricHighlight(escapeHtml(b))}</li>`).join('')}
          </ul>
        </div>
      `).join('')}
    </section>
    ` : ''}

    <!-- Featured Projects -->
    ${projects && projects.length > 0 ? `
    <section class="section">
      <h2 class="section-title">Key Projects & Technical Deliverables</h2>
      ${projects.map(proj => `
        <div class="entry">
          <div class="entry-header">
            <div class="entry-title-wrap">
              <span class="entry-bold">${escapeHtml(proj.title)}</span>
              ${proj.techStack ? ` | <em>${escapeHtml(proj.techStack)}</em>` : ''}
            </div>
            <div class="entry-meta">${escapeHtml(proj.period || 'Technical Deliverable')}</div>
          </div>
          <ul class="bullets">
            ${(proj.bullets || []).map(b => `<li>${formatMetricHighlight(escapeHtml(b))}</li>`).join('')}
          </ul>
        </div>
      `).join('')}
    </section>
    ` : ''}

    <!-- Education -->
    ${education && education.length > 0 ? `
    <section class="section">
      <h2 class="section-title">Education</h2>
      ${education.map(edu => `
        <div class="edu-entry">
          <div>
            <span class="edu-degree">${escapeHtml(edu.degree)}</span>
            ${edu.institution ? ` - <span class="edu-inst">${escapeHtml(edu.institution)}</span>` : ''}
          </div>
          <span class="edu-year">${escapeHtml(edu.year || '')}</span>
        </div>
      `).join('')}
    </section>
    ` : ''}

    <!-- Certifications -->
    ${certifications && certifications.length > 0 ? `
    <section class="section">
      <h2 class="section-title">Certifications & Achievements</h2>
      ${certifications.map(c => `
        <div class="cert-line">• ${escapeHtml(c)}</div>
      `).join('')}
    </section>
    ` : ''}
  </div>
</body>
</html>`;
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Bolds numbers, percentages, and metrics for executive readability
function formatMetricHighlight(text) {
  if (!text) return "";
  // Bold percentages, metrics, and key numbers (e.g. 99.9%, 40%, 10k+, 50ms)
  return text.replace(/(\b\d+(\.\d+)?(%|\+|x|k|ms|s| RPS)?\b)/gi, '<strong>$1</strong>');
}

module.exports = { renderAtsResumeHtml };
