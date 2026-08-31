import React, { useState, useEffect } from "react";
import "../style/interview.scss";
import { useInterview } from "../hooks/useInterview.js";
import { useParams, Link } from "react-router-dom";

const NAV_ITEMS = [
  {
    id: "technical",
    label: "Technical Q&A",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
    ),
  },
  {
    id: "behavioral",
    label: "Behavioral Q&A",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
    ),
  },
  {
    id: "roadmap",
    label: "Prep Roadmap",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>
    ),
  },
];

// ── Accordion Question Card ───────────────────────────────────
const QuestionCard = ({ item, index }) => {
  const [open, setOpen] = useState(index === 0);

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
        <span className={`q-card__chevron ${open ? "q-card__chevron--open" : ""}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
        </span>
      </button>

      {open && (
        <div className="q-card__body">
          {item?.intention && (
            <div className="q-card__section q-card__section--intention">
              <div className="q-card__tag">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                Interviewer's Objective
              </div>
              <p>{item.intention}</p>
            </div>
          )}

          {(item?.answer || item?.modelAnswer) && (
            <div className="q-card__section q-card__section--answer">
              <div className="q-card__tag">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Recommended Answer Strategy
              </div>
              <p>{item.answer || item.modelAnswer}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Roadmap Timeline Node ─────────────────────────────────────
const RoadMapDay = ({ day }) => (
  <div className="roadmap-day">
    <div className="roadmap-day__timeline">
      <div className="roadmap-day__badge">Day {day?.day}</div>
      <div className="roadmap-day__line"></div>
    </div>
    <div className="roadmap-day__content">
      <h3 className="roadmap-day__focus">{day?.focus || day?.topic}</h3>
      <ul className="roadmap-day__tasks">
        {(day?.tasks || []).map((task, i) => (
          <li key={i}>
            <span className="task-bullet"></span>
            <span>{task}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

// ── Main Dashboard ───────────────────────────────────────────
const Interview = () => {
  const [activeNav, setActiveNav] = useState("technical");
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const { report: rawReport, getReportById, loading, getResumePdf } = useInterview();
  const { interviewId } = useParams();

  useEffect(() => {
    if (interviewId) {
      getReportById(interviewId);
    }
  }, [interviewId]);

  const report = rawReport?.interviewReport || rawReport;

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      await getResumePdf(interviewId);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (loading || !report) {
    return (
      <main className="interview-loading-screen">
        <div className="loader-box">
          <div className="spinner"></div>
          <h2>Loading Strategy Report...</h2>
          <p>Analyzing questions and personalized roadmap</p>
        </div>
      </main>
    );
  }

  const technicalQuestions = report?.technicalQuestions || [];
  const behavioralQuestions = report?.behavioralQuestions || [];
  const preparationPlan = report?.preparationPlan || [];
  const skillGaps = report?.skillGaps || [];
  const matchScore = report?.matchScore ?? 0;

  const scoreTier =
    matchScore >= 80 ? "high" : matchScore >= 60 ? "mid" : "low";

  return (
    <div className="interview-page">
      {/* Background ambient glowing orbs */}
      <div className="glow-orb orb-1"></div>
      <div className="glow-orb orb-2"></div>

      {/* Top Breadcrumb Navigation */}
      <header className="interview-topbar">
        <Link to="/" className="back-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back to Dashboard
        </Link>
        <span className="topbar-chip">Interactive Interview Strategy</span>
      </header>

      <div className="interview-layout">
        {/* ── Left Sidebar: Navigation & Actions ── */}
        <nav className="interview-nav">
          <div className="nav-content">
            <p className="interview-nav__label">Curated Sections</p>
            <div className="nav-links">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  className={`interview-nav__item ${activeNav === item.id ? "interview-nav__item--active" : ""}`}
                  onClick={() => setActiveNav(item.id)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-text">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleDownloadPdf}
            className={`button action-button ${downloadingPdf ? "loading" : ""}`}
            disabled={downloadingPdf}
          >
            {downloadingPdf ? (
              <span className="btn-spinner"></span>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>
                Export Tailored Resume
              </>
            )}
          </button>
        </nav>

        {/* ── Center Content: Q&A & Timeline Roadmap ── */}
        <main className="interview-content">
          {activeNav === "technical" && (
            <section className="section-pane">
              <div className="content-header">
                <div>
                  <h2>Technical Questions</h2>
                  <p className="subtitle">Core concepts and system-design questions expected for this role</p>
                </div>
                <span className="count-pill">{technicalQuestions.length} Questions</span>
              </div>
              <div className="q-list">
                {technicalQuestions.map((q, i) => (
                  <QuestionCard key={i} item={q} index={i} />
                ))}
              </div>
            </section>
          )}

          {activeNav === "behavioral" && (
            <section className="section-pane">
              <div className="content-header">
                <div>
                  <h2>Behavioral Questions</h2>
                  <p className="subtitle">Culture-fit & situational questions using the STAR framework</p>
                </div>
                <span className="count-pill">{behavioralQuestions.length} Questions</span>
              </div>
              <div className="q-list">
                {behavioralQuestions.map((q, i) => (
                  <QuestionCard key={i} item={q} index={i} />
                ))}
              </div>
            </section>
          )}

          {activeNav === "roadmap" && (
            <section className="section-pane">
              <div className="content-header">
                <div>
                  <h2>Preparation Roadmap</h2>
                  <p className="subtitle">Step-by-step master plan designed around your timeline</p>
                </div>
                <span className="count-pill">{preparationPlan.length} Days</span>
              </div>
              <div className="roadmap-list">
                {preparationPlan.map((day) => (
                  <RoadMapDay key={day.day} day={day} />
                ))}
              </div>
            </section>
          )}
        </main>

        {/* ── Right Sidebar: Profile Analytics & Insights ── */}
        <aside className="interview-sidebar">
          {/* Match Score Gauge */}
          <div className="metric-box match-score-card">
            <p className="metric-title">Profile Match Score</p>
            <div className={`score-ring score-ring--${scoreTier}`}>
              <div className="score-inner">
                <span className="score-number">{matchScore}</span>
                <span className="score-symbol">%</span>
              </div>
            </div>
            <p className="score-caption">
              {matchScore >= 80 ? "Strong alignment with role criteria" : "Areas identified for key preparation"}
            </p>
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
                    <span key={i} className={`skill-pill skill-pill--${severity}`}>
                      {label}
                    </span>
                  );
                })
              ) : (
                <p className="empty-gaps">No major gaps detected!</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Interview;