import React, { useState, useRef } from "react";
import "../style/home.scss";
import { useInterview } from "../hooks/useInterview.js";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { loading, generateReport, reports = [] } = useInterview();
  const [jobDescription, setJobDescription] = useState("");
  const [selfDescription, setSelfDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const resumeInputRef = useRef();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleGenerateReport = async () => {
    const resumeFile = resumeInputRef.current?.files?.[0];
    if (!jobDescription.trim()) {
      alert("Please provide a Job Description!");
      return;
    }
    if (!resumeFile && !selfDescription.trim()) {
      alert("Please upload a resume or provide a quick self-description!");
      return;
    }

    try {
      setIsGenerating(true);
      const data = await generateReport({ jobDescription, selfDescription, resumeFile });
      if (data?._id) {
        navigate(`/interview/${data._id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <main className="loading-screen">
        <div className="loader-container">
          <div className="spinner"></div>
          <h2>Analyzing your profile & building strategy...</h2>
          <p>This usually takes around 20-30 seconds</p>
        </div>
      </main>
    );
  }

  return (
    <div className="home-page">
      {/* Background glowing orbs */}
      <div className="glow-orb orb-1"></div>
      <div className="glow-orb orb-2"></div>

      {/* Page Header */}
      <header className="page-header">
        <div className="badge-tag">AI Powered Career Prep</div>
        <h1>
          Create Your Custom <span className="highlight">Interview Strategy</span>
        </h1>
        <p>
          Let our advanced AI analyze the job requirements and your unique background to build a winning interview blueprint.
        </p>
      </header>

      {/* Main Glass Card */}
      <div className="interview-card">
        <div className="interview-card__body">
          {/* Left Panel - Job Description */}
          <div className="panel panel--left">
            <div className="panel__header">
              <div className="title-wrap">
                <span className="panel__icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                </span>
                <h2>Target Job Description</h2>
              </div>
              <span className="badge badge--required">Required</span>
            </div>

            <textarea
              onChange={(e) => setJobDescription(e.target.value)}
              value={jobDescription}
              className="panel__textarea"
              placeholder="Paste the full job description here... (Responsibilities, requirements, tech stack, etc.)"
              maxLength={5000}
              required
            />
            <div className="char-counter">{jobDescription.length} / 5000 chars</div>
          </div>

          {/* Vertical Divider */}
          <div className="panel-divider" />

          {/* Right Panel - Profile */}
          <div className="panel panel--right">
            <div className="panel__header">
              <div className="title-wrap">
                <span className="panel__icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                </span>
                <h2>Your Profile</h2>
              </div>
            </div>

            {/* Upload Resume */}
            <div className="upload-section">
              <label className="section-label">
                Upload Resume
                <span className="badge badge--best">Recommended</span>
              </label>

              <label className={`dropzone ${selectedFile ? "dropzone--active" : ""}`} htmlFor="resume">
                <span className="dropzone__icon">
                  {selectedFile ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
                  )}
                </span>
                <p className="dropzone__title">
                  {selectedFile ? selectedFile.name : "Click to upload or drag & drop"}
                </p>
                <p className="dropzone__subtitle">
                  {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : "PDF or DOCX (Max 5MB)"}
                </p>
                <input
                  ref={resumeInputRef}
                  hidden
                  type="file"
                  id="resume"
                  name="resume"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  required
                />
              </label>
            </div>

            {/* OR Divider */}
            <div className="or-divider">
              <span>OR</span>
            </div>

            {/* Quick Self-Description */}
            <div className="self-description">
              <label className="section-label" htmlFor="selfDescription">Quick Summary</label>
              <textarea
                onChange={(e) => setSelfDescription(e.target.value)}
                value={selfDescription}
                id="selfDescription"
                name="selfDescription"
                className="panel__textarea panel__textarea--short"
                placeholder="Describe your background, years of experience, core skills if resume isn't available..."
              />
            </div>

            {/* Info Box */}
            <div className="info-box">
              <span className="info-box__icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
              </span>
              <p>Either a <strong>Resume</strong> or <strong>Summary</strong> is required for tailored matching.</p>
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="interview-card__footer">
          <span className="footer-info">
            <span className="pulse-dot"></span> AI Synthesis &bull; ~30s turnaround
          </span>
          <button
            onClick={handleGenerateReport}
            className={`generate-btn ${isGenerating ? "loading" : ""}`}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <span className="btn-spinner"></span>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>
                Generate Interview Strategy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Recent Reports List */}
      {reports && reports.length > 0 && (
        <section className="recent-reports">
          <div className="section-heading">
            <h2>Recent Interview Plans</h2>
            <span className="report-count">{reports.length} Prepared</span>
          </div>

          <div className="reports-grid">
            {reports.map((report) => (
              <div
                key={report._id}
                className="report-card"
                onClick={() => navigate(`/interview/${report._id}`)}
              >
                <div className="report-card__header">
                  <h3>{report.title || "Untitled Target Role"}</h3>
                  <span
                    className={`score-tag ${
                      report.matchScore >= 80 ? "score--high" : report.matchScore >= 60 ? "score--mid" : "score--low"
                    }`}
                  >
                    {report.matchScore}% Match
                  </span>
                </div>
                <div className="report-card__footer">
                  <span className="report-meta">
                    Generated: {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                  <span className="arrow-icon">→</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Page Footer */}
      <footer className="page-footer">
        <a href="#privacy">Privacy Policy</a>
        <a href="#terms">Terms of Service</a>
        <a href="#help">Help Center</a>
      </footer>
    </div>
  );
};

export default Home;