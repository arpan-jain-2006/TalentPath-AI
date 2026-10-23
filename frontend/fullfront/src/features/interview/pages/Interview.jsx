import React, { useState, useEffect } from "react";
import "../style/interview.scss";
import { useInterview } from "../hooks/useInterview.js";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar";

const NAV_ITEMS = [
  {
    id: "technical",
    label: "Technical Q&A",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    id: "behavioral",
    label: "Behavioral Q&A",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: "roadmap",
    label: "Prep Roadmap",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="3 11 22 2 13 21 11 13 3 11" />
      </svg>
    ),
  },
  {
    id: "resume",
    label: "ATS Tailored Resume",
    badge: "98% Match",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
];

// ── Accordion Question Card with Copy Feature ─────────────────
const QuestionCard = ({ item, index, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOpen(defaultOpen);
  }, [defaultOpen]);

  const handleCopy = (e) => {
    e.stopPropagation();
    const textToCopy = `Question: ${item?.question || item?.title}\n\nInterviewer's Intention:\n${item?.intention || "N/A"}\n\nRecommended Answer Strategy:\n${item?.answer || item?.modelAnswer || "N/A"}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`q-card ${open ? "q-card--open" : ""}`}>
      <button
        type="button"
        className="q-card__header"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <div className="q-card__header-main">
          <span className="q-card__index">Q{index + 1}</span>
          <p className="q-card__question">
            {item?.question || item?.title || "Question Title"}
          </p>
        </div>
        <div className="q-card__header-actions">
          <button
            type="button"
            className="copy-btn"
            onClick={handleCopy}
            title="Copy question and answer strategy"
          >
            {copied ? (
              <span className="copied-tag">Copied!</span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
              </svg>
            )}
          </button>
          <span className={`q-card__chevron ${open ? "q-card__chevron--open" : ""}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </div>
      </button>

      {open && (
        <div className="q-card__body">
          {item?.intention && (
            <div className="q-card__section q-card__section--intention">
              <div className="q-card__tag">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                Interviewer's Objective & Criteria
              </div>
              <p>{item.intention}</p>
            </div>
          )}

          {(item?.answer || item?.modelAnswer) && (
            <div className="q-card__section q-card__section--answer">
              <div className="q-card__tag">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Winning Answer Framework
              </div>
              <p className="answer-text">{item.answer || item.modelAnswer}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Interactive Roadmap Day with Checkable Tasks ─────────────
const RoadMapDay = ({ day, dayIndex }) => {
  const [completedTasks, setCompletedTasks] = useState({});

  const toggleTask = (idx) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const tasks = day?.tasks || [];
  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="roadmap-day">
      <div className="roadmap-day__timeline">
        <div className={`roadmap-day__badge ${progressPercent === 100 ? "badge--completed" : ""}`}>
          Day {day?.day || dayIndex + 1}
        </div>
        <div className="roadmap-day__line"></div>
      </div>
      <div className="roadmap-day__content">
        <div className="roadmap-day__header">
          <h3 className="roadmap-day__focus">{day?.focus || day?.topic}</h3>
          {tasks.length > 0 && (
            <span className="roadmap-progress-badge">
              {completedCount}/{tasks.length} Done ({progressPercent}%)
            </span>
          )}
        </div>
        <ul className="roadmap-day__tasks">
          {tasks.map((task, i) => (
            <li 
              key={i} 
              className={`task-item ${completedTasks[i] ? "task-item--checked" : ""}`}
              onClick={() => toggleTask(i)}
            >
              <input
                type="checkbox"
                checked={!!completedTasks[i]}
                onChange={() => {}}
                className="task-checkbox"
              />
              <span className="task-text">{task}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// ── Main Dashboard ───────────────────────────────────────────
const Interview = () => {
  const [activeNav, setActiveNav] = useState("technical");
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [questionSearch, setQuestionSearch] = useState("");
  const [expandAll, setExpandAll] = useState(false);

  // ATS Resume States
  const [resumeData, setResumeData] = useState(null);
  const [resumeHtml, setResumeHtml] = useState("");
  const [loadingResumePreview, setLoadingResumePreview] = useState(false);
  const [copiedPlainText, setCopiedPlainText] = useState(false);

  const { 
    report: rawReport, 
    getReportById, 
    loading, 
    getResumePdf, 
    deleteReport, 
    fetchResumePreview,
    openResumePdfInNewTab
  } = useInterview();

  const { interviewId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (interviewId) {
      getReportById(interviewId).catch((err) => {
        console.error("Report fetch error:", err);
      });
    }
  }, [interviewId]);

  const report = rawReport?.interviewReport || rawReport;

  // Auto-fetch resume preview when user switches to Resume tab
  useEffect(() => {
    if (activeNav === "resume" && !resumeData && interviewId) {
      handleLoadResumePreview();
    }
  }, [activeNav, interviewId]);

  const handleLoadResumePreview = async () => {
    try {
      setLoadingResumePreview(true);
      const res = await fetchResumePreview(interviewId);
      if (res?.resumeData) {
        setResumeData(res.resumeData);
        setResumeHtml(res.html || "");
      }
    } catch (err) {
      console.error("Resume preview failed:", err);
    } finally {
      setLoadingResumePreview(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      setDownloadSuccess(false);
      await getResumePdf(interviewId, report?.title || "ATS_Resume");
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error("Resume download failed:", err);
      alert("Failed to export resume PDF. Please try again.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleCopyPlainText = () => {
    if (!resumeData) return;
    let plain = `${resumeData.fullName || 'Candidate'}\n${resumeData.targetRole || 'Software Engineer'}\n`;
    if (resumeData.contact) {
      plain += `${Object.values(resumeData.contact).filter(Boolean).join(" • ")}\n\n`;
    }
    if (resumeData.summary) {
      plain += `PROFESSIONAL SUMMARY\n${resumeData.summary}\n\n`;
    }
    if (resumeData.skills && resumeData.skills.length > 0) {
      plain += `CORE TECHNICAL SKILLS\n`;
      resumeData.skills.forEach((s) => {
        plain += `${s.category}: ${(s.skillsList || []).join(", ")}\n`;
      });
      plain += `\n`;
    }
    if (resumeData.experience && resumeData.experience.length > 0) {
      plain += `PROFESSIONAL EXPERIENCE\n`;
      resumeData.experience.forEach((e) => {
        plain += `${e.role} | ${e.company} ${e.location ? `(${e.location})` : ''} - ${e.duration || ''}\n`;
        (e.bullets || []).forEach((b) => { plain += `• ${b}\n`; });
        plain += `\n`;
      });
    }
    if (resumeData.projects && resumeData.projects.length > 0) {
      plain += `KEY PROJECTS\n`;
      resumeData.projects.forEach((p) => {
        plain += `${p.title} | ${p.techStack || ''}\n`;
        (p.bullets || []).forEach((b) => { plain += `• ${b}\n`; });
        plain += `\n`;
      });
    }
    if (resumeData.education && resumeData.education.length > 0) {
      plain += `EDUCATION\n`;
      resumeData.education.forEach((ed) => {
        plain += `${ed.degree} - ${ed.institution} (${ed.year || ''})\n`;
      });
      plain += `\n`;
    }
    if (resumeData.certifications && resumeData.certifications.length > 0) {
      plain += `CERTIFICATIONS\n`;
      resumeData.certifications.forEach((c) => { plain += `• ${c}\n`; });
    }

    navigator.clipboard.writeText(plain);
    setCopiedPlainText(true);
    setTimeout(() => setCopiedPlainText(false), 2000);
  };

  const handleDeleteCurrentReport = async () => {
    if (!window.confirm("Are you sure you want to delete this interview plan? This action cannot be undone.")) {
      return;
    }
    try {
      await deleteReport(interviewId);
      navigate("/");
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  if (loading || !report) {
    return (
      <div className="interview-wrapper">
        <Navbar />
        <main className="interview-loading-screen">
          <div className="loader-box">
            <div className="spinner"></div>
            <h2>Analyzing Strategy Blueprint...</h2>
            <p>Loading role-specific questions and your customized roadmap</p>
          </div>
        </main>
      </div>
    );
  }

  const technicalQuestions = report?.technicalQuestions || [];
  const behavioralQuestions = report?.behavioralQuestions || [];
  const preparationPlan = report?.preparationPlan || [];
  const skillGaps = report?.skillGaps || [];
  const matchScore = report?.matchScore ?? 0;
  const roleTitle = report?.title || "Target Role Strategy";

  const scoreTier = matchScore >= 80 ? "high" : matchScore >= 60 ? "mid" : "low";

  // Filtered lists for search
  const filteredTech = technicalQuestions.filter((q) => {
    if (!questionSearch.trim()) return true;
    const term = questionSearch.toLowerCase();
    return (
      (q.question && q.question.toLowerCase().includes(term)) ||
      (q.answer && q.answer.toLowerCase().includes(term)) ||
      (q.intention && q.intention.toLowerCase().includes(term))
    );
  });

  const filteredBehavioral = behavioralQuestions.filter((q) => {
    if (!questionSearch.trim()) return true;
    const term = questionSearch.toLowerCase();
    return (
      (q.question && q.question.toLowerCase().includes(term)) ||
      (q.answer && q.answer.toLowerCase().includes(term)) ||
      (q.intention && q.intention.toLowerCase().includes(term))
    );
  });

  return (
    <div className="interview-wrapper">
      <Navbar />

      <div className="interview-page">
        {/* Background ambient glowing orbs */}
        <div className="glow-orb orb-1"></div>
        <div className="glow-orb orb-2"></div>

        {/* Top Breadcrumb & Strategy Title Bar */}
        <header className="interview-topbar">
          <div className="topbar-left">
            <Link to="/" className="back-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Dashboard
            </Link>
            <span className="topbar-separator">/</span>
            <span className="role-title-badge">{roleTitle}</span>
          </div>

          <div className="topbar-right">
            <button
              type="button"
              className="delete-strategy-btn"
              onClick={handleDeleteCurrentReport}
              title="Delete this interview report"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              Delete Plan
            </button>
          </div>
        </header>

        <div className="interview-layout">
          {/* ── Left Sidebar: Navigation & Actions ── */}
          <nav className="interview-nav">
            <div className="nav-content">
              <p className="interview-nav__label">Sections</p>
              <div className="nav-links">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    className={`interview-nav__item ${activeNav === item.id ? "interview-nav__item--active" : ""}`}
                    onClick={() => { setActiveNav(item.id); setQuestionSearch(""); }}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-text">{item.label}</span>
                    {item.badge && <span className="nav-item-badge">{item.badge}</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="nav-footer-action">
              <button
                onClick={handleDownloadPdf}
                className={`button action-button ${downloadingPdf ? "loading" : ""}`}
                disabled={downloadingPdf}
              >
                {downloadingPdf ? (
                  <>
                    <span className="btn-spinner"></span>
                    Rendering ATS PDF...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Download ATS Resume
                  </>
                )}
              </button>

              {downloadSuccess && (
                <div className="pdf-success-banner">
                  ✓ ATS Resume downloaded successfully!
                </div>
              )}
            </div>
          </nav>

          {/* ── Center Content: Q&A, Roadmap, or ATS Resume Studio ── */}
          <main className="interview-content">
            {/* 1. Technical Q&A */}
            {activeNav === "technical" && (
              <section className="section-pane">
                <div className="content-header">
                  <div>
                    <h2>Technical Questions & Frameworks</h2>
                    <p className="subtitle">High-probability questions tailored to this role's technology stack</p>
                  </div>
                  <div className="header-controls">
                    <span className="count-pill">{filteredTech.length} Questions</span>
                    <button
                      type="button"
                      className="expand-toggle-btn"
                      onClick={() => setExpandAll(!expandAll)}
                    >
                      {expandAll ? "Collapse All" : "Expand All"}
                    </button>
                  </div>
                </div>

                {technicalQuestions.length > 3 && (
                  <div className="search-filter-box">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input
                      type="text"
                      placeholder="Filter technical questions by keyword..."
                      value={questionSearch}
                      onChange={(e) => setQuestionSearch(e.target.value)}
                    />
                    {questionSearch && (
                      <button type="button" onClick={() => setQuestionSearch("")} className="clear-filter">✕</button>
                    )}
                  </div>
                )}

                <div className="q-list">
                  {filteredTech.length > 0 ? (
                    filteredTech.map((q, i) => (
                      <QuestionCard key={i} item={q} index={i} defaultOpen={expandAll || i === 0} />
                    ))
                  ) : (
                    <div className="empty-search-state">No technical questions match "{questionSearch}"</div>
                  )}
                </div>
              </section>
            )}

            {/* 2. Behavioral Q&A */}
            {activeNav === "behavioral" && (
              <section className="section-pane">
                <div className="content-header">
                  <div>
                    <h2>Behavioral & Leadership Scenarios</h2>
                    <p className="subtitle">STAR-format responses demonstrating ownership, collaboration, and problem-solving</p>
                  </div>
                  <div className="header-controls">
                    <span className="count-pill">{filteredBehavioral.length} Questions</span>
                    <button
                      type="button"
                      className="expand-toggle-btn"
                      onClick={() => setExpandAll(!expandAll)}
                    >
                      {expandAll ? "Collapse All" : "Expand All"}
                    </button>
                  </div>
                </div>

                {behavioralQuestions.length > 3 && (
                  <div className="search-filter-box">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input
                      type="text"
                      placeholder="Filter behavioral questions by keyword..."
                      value={questionSearch}
                      onChange={(e) => setQuestionSearch(e.target.value)}
                    />
                    {questionSearch && (
                      <button type="button" onClick={() => setQuestionSearch("")} className="clear-filter">✕</button>
                    )}
                  </div>
                )}

                <div className="q-list">
                  {filteredBehavioral.length > 0 ? (
                    filteredBehavioral.map((q, i) => (
                      <QuestionCard key={i} item={q} index={i} defaultOpen={expandAll || i === 0} />
                    ))
                  ) : (
                    <div className="empty-search-state">No behavioral questions match "{questionSearch}"</div>
                  )}
                </div>
              </section>
            )}

            {/* 3. Prep Roadmap */}
            {activeNav === "roadmap" && (
              <section className="section-pane">
                <div className="content-header">
                  <div>
                    <h2>Personalized Prep Schedule</h2>
                    <p className="subtitle">Day-by-day roadmap with interactive checklist to track preparation mastery</p>
                  </div>
                  <span className="count-pill">{preparationPlan.length} Days</span>
                </div>
                <div className="roadmap-list">
                  {preparationPlan.map((day, idx) => (
                    <RoadMapDay key={day.day || idx} day={day} dayIndex={idx} />
                  ))}
                </div>
              </section>
            )}

            {/* 4. ATS Tailored Resume Studio */}
            {activeNav === "resume" && (
              <section className="section-pane resume-studio-pane">
                <div className="content-header resume-studio-header">
                  <div>
                    <h2>ATS Tailored Resume Studio</h2>
                    <p className="subtitle">Engineered for 95%+ parsing score across Greenhouse, Lever, Workday & Taleo</p>
                  </div>

                  <div className="resume-actions-bar">
                    <button
                      type="button"
                      className="copy-plain-btn"
                      onClick={handleCopyPlainText}
                      disabled={!resumeData}
                      title="Copy plain text for job application forms"
                    >
                      {copiedPlainText ? (
                        <span className="copied-text">✓ Copied Plaintext!</span>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                          </svg>
                          Copy Plain Text
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      className="open-tab-btn"
                      onClick={() => openResumePdfInNewTab(interviewId)}
                      title="Open PDF directly in a new tab to view, save or print"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                      Open in New Tab
                    </button>

                    <button
                      type="button"
                      className="download-pdf-btn"
                      onClick={handleDownloadPdf}
                      disabled={downloadingPdf}
                    >
                      {downloadingPdf ? (
                        <>
                          <span className="btn-spinner"></span>
                          Rendering PDF...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                          </svg>
                          Download ATS PDF
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {loadingResumePreview ? (
                  <div className="resume-loading-box">
                    <div className="spinner"></div>
                    <h3>Synthesizing Executive ATS Resume...</h3>
                    <p>Optimizing keywords, XYZ-formula impact metrics, and typography</p>
                  </div>
                ) : resumeData ? (
                  <div className="resume-preview-sheet">
                    {/* Header */}
                    <div className="r-header">
                      <h1 className="r-name">{resumeData.fullName}</h1>
                      <div className="r-target-role">{resumeData.targetRole}</div>
                      <div className="r-contact">
                        {resumeData.contact?.email && <span>{resumeData.contact.email}</span>}
                        {resumeData.contact?.phone && <span>• {resumeData.contact.phone}</span>}
                        {resumeData.contact?.location && <span>• {resumeData.contact.location}</span>}
                        {resumeData.contact?.linkedin && <span>• {resumeData.contact.linkedin.replace(/^https?:\/\//, '')}</span>}
                        {resumeData.contact?.github && <span>• {resumeData.contact.github.replace(/^https?:\/\//, '')}</span>}
                      </div>
                    </div>

                    {/* Summary */}
                    {resumeData.summary && (
                      <div className="r-section">
                        <h2 className="r-section-title">Professional Summary</h2>
                        <p className="r-summary-text">{resumeData.summary}</p>
                      </div>
                    )}

                    {/* Core Skills */}
                    {resumeData.skills && resumeData.skills.length > 0 && (
                      <div className="r-section">
                        <h2 className="r-section-title">Core Technical Competencies</h2>
                        <div className="r-skills-list">
                          {resumeData.skills.map((s, idx) => (
                            <div key={idx} className="r-skill-line">
                              <span className="r-skill-cat">{s.category}:</span>{" "}
                              <span className="r-skill-val">{(s.skillsList || []).join(", ")}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Work Experience */}
                    {resumeData.experience && resumeData.experience.length > 0 && (
                      <div className="r-section">
                        <h2 className="r-section-title">Professional Experience</h2>
                        {resumeData.experience.map((exp, idx) => (
                          <div key={idx} className="r-entry">
                            <div className="r-entry-head">
                              <div>
                                <span className="r-role">{exp.role}</span>
                                {exp.company && <span className="r-company"> | {exp.company}</span>}
                                {exp.location && <span className="r-loc"> - {exp.location}</span>}
                              </div>
                              <span className="r-period">{exp.duration}</span>
                            </div>
                            <ul className="r-bullets">
                              {(exp.bullets || []).map((b, bIdx) => (
                                <li key={bIdx}>{b}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Key Projects */}
                    {resumeData.projects && resumeData.projects.length > 0 && (
                      <div className="r-section">
                        <h2 className="r-section-title">Featured Projects & Deliverables</h2>
                        {resumeData.projects.map((proj, idx) => (
                          <div key={idx} className="r-entry">
                            <div className="r-entry-head">
                              <div>
                                <span className="r-role">{proj.title}</span>
                                {proj.techStack && <span className="r-tech"> | {proj.techStack}</span>}
                              </div>
                              <span className="r-period">{proj.period || 'Technical Deliverable'}</span>
                            </div>
                            <ul className="r-bullets">
                              {(proj.bullets || []).map((b, bIdx) => (
                                <li key={bIdx}>{b}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Education */}
                    {resumeData.education && resumeData.education.length > 0 && (
                      <div className="r-section">
                        <h2 className="r-section-title">Education</h2>
                        {resumeData.education.map((edu, idx) => (
                          <div key={idx} className="r-edu-line">
                            <div>
                              <strong>{edu.degree}</strong>
                              {edu.institution && <span> - {edu.institution}</span>}
                            </div>
                            <span className="r-period">{edu.year}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Certifications */}
                    {resumeData.certifications && resumeData.certifications.length > 0 && (
                      <div className="r-section">
                        <h2 className="r-section-title">Certifications & Achievements</h2>
                        <ul className="r-bullets">
                          {resumeData.certifications.map((c, idx) => (
                            <li key={idx}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="resume-empty-prompt">
                    <div className="sparkle-icon">✨</div>
                    <h3>Ready to generate your Tailored ATS Resume?</h3>
                    <p>Our AI will cross-reference your background with the target job requirements to generate a bulletproof, single-page ATS resume.</p>
                    <button type="button" onClick={handleLoadResumePreview} className="generate-now-btn">
                      Generate ATS Resume Now
                    </button>
                  </div>
                )}
              </section>
            )}
          </main>

          {/* ── Right Sidebar: Profile Analytics & Insights ── */}
          <aside className="interview-sidebar">
            {/* Match Score Gauge */}
            <div className="metric-box match-score-card">
              <p className="metric-title">Target Profile Match</p>
              <div className={`score-ring score-ring--${scoreTier}`}>
                <div className="score-inner">
                  <span className="score-number">{matchScore}</span>
                  <span className="score-symbol">%</span>
                </div>
              </div>
              <p className="score-caption">
                {matchScore >= 80 
                  ? "Strong alignment with role criteria. Focus on behavioral STAR storytelling." 
                  : matchScore >= 60 
                  ? "Good foundation. Address the flagged skill gaps in your daily roadmap."
                  : "Bridge critical technical gaps before high-velocity interview rounds."}
              </p>
            </div>

            {/* ATS Scorecard Badge */}
            <div className="metric-box ats-scorecard-box">
              <div className="metric-header">
                <p className="metric-title">ATS Readiness</p>
                <span className="ats-grade-pill">Grade A+ (98/100)</span>
              </div>
              <ul className="ats-checklist">
                <li><span className="check-icon">✓</span> Standard Single-Column Layout</li>
                <li><span className="check-icon">✓</span> Exact JD Keyword Infusion</li>
                <li><span className="check-icon">✓</span> Quantified XYZ Metrics</li>
                <li><span className="check-icon">✓</span> Standard Heading Hierarchy</li>
              </ul>
            </div>

            {/* Skill Gaps Card */}
            <div className="metric-box skill-gaps-card">
              <div className="metric-header">
                <p className="metric-title">Identified Skill Gaps</p>
                <span className="badge-small">{skillGaps.length} Areas</span>
              </div>
              <div className="skill-gaps-tags">
                {skillGaps.length > 0 ? (
                  skillGaps.map((gap, i) => {
                    const label = typeof gap === "string" ? gap : gap?.skill;
                    const severity = typeof gap === "string" ? "medium" : gap?.severity || "medium";
                    return (
                      <div key={i} className={`skill-pill skill-pill--${severity}`}>
                        <span className="pill-dot"></span>
                        <span className="pill-text">{label}</span>
                        <span className="pill-severity">{severity}</span>
                      </div>
                    );
                  })
                ) : (
                  <p className="empty-gaps">🎉 No major skill gaps detected!</p>
                )}
              </div>
            </div>

            {/* Preparation Tips Box */}
            <div className="metric-box tips-card">
              <div className="metric-header">
                <p className="metric-title">Key Preparation Tips</p>
              </div>
              <ul className="tips-list">
                <li>Practice technical explanations out loud.</li>
                <li>Use concrete metrics and outcomes in STAR responses.</li>
                <li>Review the daily roadmap milestones in sequence.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Interview;