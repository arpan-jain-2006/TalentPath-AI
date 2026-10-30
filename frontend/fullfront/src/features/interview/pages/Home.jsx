import React, { useState, useEffect, useRef } from "react";
import "../style/home.scss";
import { useInterview } from "../hooks/useInterview.js";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar";

const SAMPLE_ROLES = [
  {
    title: "MERN Stack Engineer",
    jd: "Looking for a MERN Stack Developer proficient in React, Node.js, Express, and MongoDB. Responsibilities include building scalable REST APIs, managing state with Context/Redux, implementing secure JWT authentication, and integrating AI models. Experience with database indexing and cloud deployments is a strong plus.",
    summary: "Full stack developer with experience building responsive web applications using React, Node.js, Express, and MongoDB. Strong knowledge of RESTful API design and JWT auth."
  },
  {
    title: "Frontend Specialist",
    jd: "We are hiring a Frontend Engineer with deep expertise in modern React, Vite, SCSS, responsive design, component lifecycle, and web performance optimization. Must have experience consuming asynchronous APIs, managing client state, and building polished interactive user interfaces.",
    summary: "Frontend developer specializing in modern React, responsive UI design, CSS/SCSS architecture, and seamless user experiences."
  },
  {
    title: "Backend & Systems Engineer",
    jd: "Seeking a Backend Engineer to build resilient distributed web services with Node.js, Express, and MongoDB. Required skills: API security, database schema modeling, query optimization, puppeteer automation, and third-party AI API integrations.",
    summary: "Backend developer focused on robust REST APIs, server security, database query performance, and cloud microservices."
  }
];

const Home = () => {
  const { loading, generateReport, reports = [], getReports, deleteReport } = useInterview();
  const [jobDescription, setJobDescription] = useState("");
  const [selfDescription, setSelfDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Screenshots state
  const [jdImageFile, setJdImageFile] = useState(null);
  const [jdImagePreview, setJdImagePreview] = useState(null);
  const [selfImageFile, setSelfImageFile] = useState(null);
  const [selfImagePreview, setSelfImagePreview] = useState(null);
  const [previewModalImage, setPreviewModalImage] = useState(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const resumeInputRef = useRef();
  const jdImageInputRef = useRef();
  const selfImageInputRef = useRef();
  const navigate = useNavigate();

  // Load existing user reports on mount
  useEffect(() => {
    getReports().catch(() => {});
  }, []);

  // Cleanup object URLs on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      if (jdImagePreview) URL.revokeObjectURL(jdImagePreview);
      if (selfImagePreview) URL.revokeObjectURL(selfImagePreview);
    };
  }, [jdImagePreview, selfImagePreview]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 8 * 1024 * 1024) {
        setErrorMessage("Resume file exceeds 8MB limit. Please upload a smaller PDF.");
        return;
      }
      setSelectedFile(file);
      setErrorMessage("");
    }
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (resumeInputRef.current) {
      resumeInputRef.current.value = "";
    }
  };

  // JD Screenshot Handlers
  const handleJdImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Please select a valid image file (PNG, JPG, JPEG, WEBP).");
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        setErrorMessage("JD Screenshot exceeds 8MB limit. Please choose a smaller image.");
        return;
      }
      if (jdImagePreview) {
        URL.revokeObjectURL(jdImagePreview);
      }
      setJdImageFile(file);
      setJdImagePreview(URL.createObjectURL(file));
      setErrorMessage("");
    }
  };

  const handleRemoveJdImage = (e) => {
    e.stopPropagation();
    if (jdImagePreview) URL.revokeObjectURL(jdImagePreview);
    setJdImageFile(null);
    setJdImagePreview(null);
    if (jdImageInputRef.current) jdImageInputRef.current.value = "";
  };

  // Self Profile Screenshot Handlers
  const handleSelfImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Please select a valid image file (PNG, JPG, JPEG, WEBP).");
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        setErrorMessage("Profile Screenshot exceeds 8MB limit. Please choose a smaller image.");
        return;
      }
      if (selfImagePreview) {
        URL.revokeObjectURL(selfImagePreview);
      }
      setSelfImageFile(file);
      setSelfImagePreview(URL.createObjectURL(file));
      setErrorMessage("");
    }
  };

  const handleRemoveSelfImage = (e) => {
    e.stopPropagation();
    if (selfImagePreview) URL.revokeObjectURL(selfImagePreview);
    setSelfImageFile(null);
    setSelfImagePreview(null);
    if (selfImageInputRef.current) selfImageInputRef.current.value = "";
  };

  const handleApplyTemplate = (template) => {
    setJobDescription(template.jd);
    setSelfDescription(template.summary);
    setErrorMessage("");
  };

  const handleGenerateReport = async () => {
    setErrorMessage("");
    const resumeFile = selectedFile || resumeInputRef.current?.files?.[0];

    // Must have at least JD text OR JD Screenshot
    const hasJd = jobDescription.trim().length > 0 || Boolean(jdImageFile);
    if (!hasJd) {
      setErrorMessage("Target Job Description is required. Paste job text or upload a JD screenshot.");
      return;
    }

    // Must have at least Resume (PDF) OR Self Description text OR Profile Screenshot
    const hasProfile = Boolean(resumeFile) || selfDescription.trim().length > 0 || Boolean(selfImageFile);
    if (!hasProfile) {
      setErrorMessage("Please provide your profile via Resume (PDF), Profile Screenshot, or Quick Summary.");
      return;
    }

    try {
      setIsGenerating(true);
      const data = await generateReport({ 
        jobDescription: jobDescription.trim(), 
        selfDescription: selfDescription.trim(), 
        resumeFile,
        jdImageFile,
        selfImageFile
      });
      if (data?._id) {
        navigate(`/interview/${data._id}`);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(
        err.response?.data?.message || err.message || "Failed to generate interview strategy. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteReport = async (e, reportId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this interview plan?")) {
      return;
    }
    try {
      setDeletingId(reportId);
      await deleteReport(reportId);
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (r.title && r.title.toLowerCase().includes(term)) ||
      (r.jobDescription && r.jobDescription.toLowerCase().includes(term))
    );
  });

  if (loading && !isGenerating && reports.length === 0) {
    return (
      <div className="home-wrapper">
        <Navbar />
        <main className="loading-screen">
          <div className="loader-container">
            <div className="spinner"></div>
            <h2>Connecting to Strategy Engine...</h2>
            <p>Loading your profile and workspace</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="home-wrapper">
      <Navbar />

      <div className="home-page">
        {/* Background ambient glowing orbs */}
        <div className="glow-orb orb-1"></div>
        <div className="glow-orb orb-2"></div>

        {/* Page Header */}
        <header className="page-header">
          <div className="badge-tag">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
            </svg>
            AI Powered Career Prep
          </div>
          <h1>
            Create Your Custom <span className="highlight-text">Interview Strategy</span>
          </h1>
          <p>
            Synthesize job requirements with your unique skillset to generate high-value technical Q&As, STAR behavioral scripts, and ATS resumes.
          </p>

          {/* Quick Pre-fill Templates */}
          <div className="quick-templates">
            <span className="templates-label">Quick Fill:</span>
            <div className="template-pills">
              {SAMPLE_ROLES.map((role, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="template-pill"
                  onClick={() => handleApplyTemplate(role)}
                  title="Click to pre-fill this role"
                >
                  + {role.title}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Error Notification */}
        {errorMessage && (
          <div className="error-banner">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Main Glass Card */}
        <div className="interview-card">
          <div className="interview-card__body">
            {/* Left Panel - Job Description */}
            <div className="panel panel--left">
              <div className="panel__header">
                <div className="title-wrap">
                  <span className="panel__icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                  </span>
                  <h2>Target Job Description</h2>
                </div>
                <span className={`badge ${jobDescription || jdImageFile ? "badge--best" : "badge--required"}`}>
                  {jobDescription || jdImageFile ? "✓ Ready" : "Required"}
                </span>
              </div>

              <textarea
                onChange={(e) => { setJobDescription(e.target.value); setErrorMessage(""); }}
                value={jobDescription}
                className="panel__textarea"
                placeholder="Paste the full job description text here, or upload a JD screenshot below..."
                maxLength={5000}
              />
              <div className="char-counter">{jobDescription.length} / 5000 chars</div>

              {/* JD Screenshot Upload Area */}
              <div className="screenshot-upload-wrapper">
                <div className="screenshot-upload-header">
                  <span className="screenshot-upload-label">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    Company JD Screenshot
                  </span>
                  <span className="badge badge--neutral">Text &bull; Screenshot</span>
                </div>

                {jdImagePreview ? (
                  <div className="screenshot-preview-card">
                    <div 
                      className="screenshot-thumb-box"
                      onClick={() => setPreviewModalImage({ url: jdImagePreview, title: "Company JD Screenshot" })}
                      title="Click to enlarge"
                    >
                      <img src={jdImagePreview} alt="JD Screenshot Preview" />
                      <div className="zoom-overlay">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                        </svg>
                      </div>
                    </div>
                    <div className="screenshot-info">
                      <p className="screenshot-filename">{jdImageFile?.name}</p>
                      <p className="screenshot-filesize">{((jdImageFile?.size || 0) / 1024 / 1024).toFixed(2)} MB &bull; Ready for AI analysis</p>
                      <span className="screenshot-tag">✓ JD Image Attached &amp; Saved to DB</span>
                    </div>
                    <button
                      type="button"
                      className="remove-file-btn"
                      onClick={handleRemoveJdImage}
                      title="Remove JD screenshot"
                    >
                      ✕ Remove
                    </button>
                  </div>
                ) : (
                  <div 
                    className="screenshot-dropzone"
                    onClick={() => jdImageInputRef.current?.click()}
                  >
                    <span className="screenshot-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </span>
                    <div className="dropzone-text-group">
                      <p className="dropzone-main-text">Upload Company JD Screenshot / Image</p>
                      <p className="dropzone-sub-text">PNG, JPG, WebP up to 8MB &bull; LinkedIn, Naukri, or Portal</p>
                    </div>
                  </div>
                )}

                <input
                  ref={jdImageInputRef}
                  hidden
                  type="file"
                  id="jdImage"
                  name="jdImage"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleJdImageChange}
                />
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="panel-divider" />

            {/* Right Panel - Profile */}
            <div className="panel panel--right">
              <div className="panel__header">
                <div className="title-wrap">
                  <span className="panel__icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <h2>Your Profile & Background</h2>
                </div>
                <span className={`badge ${selectedFile || selfDescription || selfImageFile ? "badge--best" : "badge--required"}`}>
                  {selectedFile || selfDescription || selfImageFile ? "✓ Ready" : "Required"}
                </span>
              </div>

              {/* Upload Resume */}
              <div className="upload-section">
                <label className="section-label">
                  Upload Resume (PDF)
                  <span className="badge badge--best">Recommended</span>
                </label>

                <div 
                  className={`dropzone ${selectedFile ? "dropzone--active" : ""}`}
                  onClick={() => resumeInputRef.current?.click()}
                >
                  <span className="dropzone__icon">
                    {selectedFile ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="16 16 12 12 8 16" />
                        <line x1="12" y1="12" x2="12" y2="21" />
                        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                      </svg>
                    )}
                  </span>
                  <p className="dropzone__title">
                    {selectedFile ? selectedFile.name : "Click to select or drag & drop resume"}
                  </p>
                  <p className="dropzone__subtitle">
                    {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready` : "PDF format (Max 8MB)"}
                  </p>

                  {selectedFile && (
                    <button
                      type="button"
                      className="remove-file-btn"
                      onClick={handleRemoveFile}
                      title="Remove file"
                    >
                      ✕ Remove
                    </button>
                  )}

                  <input
                    ref={resumeInputRef}
                    hidden
                    type="file"
                    id="resume"
                    name="resume"
                    accept=".pdf"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              {/* OR Divider */}
              <div className="or-divider">
                <span>OR</span>
              </div>

              {/* Self Profile Screenshot Upload Area */}
              <div className="screenshot-upload-wrapper">
                <div className="screenshot-upload-header">
                  <span className="screenshot-upload-label">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    Profile / Bio Screenshot
                  </span>
                  <span className="badge badge--best">Image Option</span>
                </div>

                {selfImagePreview ? (
                  <div className="screenshot-preview-card">
                    <div 
                      className="screenshot-thumb-box"
                      onClick={() => setPreviewModalImage({ url: selfImagePreview, title: "Candidate Profile Screenshot" })}
                      title="Click to enlarge"
                    >
                      <img src={selfImagePreview} alt="Self Profile Screenshot Preview" />
                      <div className="zoom-overlay">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                        </svg>
                      </div>
                    </div>
                    <div className="screenshot-info">
                      <p className="screenshot-filename">{selfImageFile?.name}</p>
                      <p className="screenshot-filesize">{((selfImageFile?.size || 0) / 1024 / 1024).toFixed(2)} MB &bull; Ready for AI analysis</p>
                      <span className="screenshot-tag">✓ Profile Image Attached &amp; Saved to DB</span>
                    </div>
                    <button
                      type="button"
                      className="remove-file-btn"
                      onClick={handleRemoveSelfImage}
                      title="Remove profile screenshot"
                    >
                      ✕ Remove
                    </button>
                  </div>
                ) : (
                  <div 
                    className="screenshot-dropzone"
                    onClick={() => selfImageInputRef.current?.click()}
                  >
                    <span className="screenshot-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </span>
                    <div className="dropzone-text-group">
                      <p className="dropzone-main-text">Upload Candidate Profile / Bio Screenshot</p>
                      <p className="dropzone-sub-text">PNG, JPG, WebP &bull; LinkedIn snippet, bio, or resume picture</p>
                    </div>
                  </div>
                )}

                <input
                  ref={selfImageInputRef}
                  hidden
                  type="file"
                  id="selfImage"
                  name="selfImage"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleSelfImageChange}
                />
              </div>

              {/* OR Divider */}
              <div className="or-divider">
                <span>OR</span>
              </div>

              {/* Quick Self-Description */}
              <div className="self-description">
                <label className="section-label" htmlFor="selfDescription">Quick Summary</label>
                <textarea
                  onChange={(e) => { setSelfDescription(e.target.value); setErrorMessage(""); }}
                  value={selfDescription}
                  id="selfDescription"
                  name="selfDescription"
                  className="panel__textarea panel__textarea--short"
                  placeholder="Describe your background, core technical skills, and years of experience..."
                />
              </div>

              {/* Info Box */}
              <div className="info-box">
                <span className="info-box__icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                </span>
                <p>Provide your background via <strong>Resume (PDF)</strong>, <strong>Profile Screenshot</strong>, or a <strong>Quick Summary</strong>.</p>
              </div>
            </div>
          </div>

          {/* Card Footer */}
          <div className="interview-card__footer">
            <span className="footer-info">
              <span className="pulse-dot"></span> AI Synthesis &bull; Fast Generation
            </span>
            <button
              onClick={handleGenerateReport}
              className={`generate-btn ${isGenerating ? "loading" : ""}`}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <span className="btn-spinner"></span>
                  Generating Blueprint...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                  </svg>
                  Generate Interview Strategy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Recent Reports List */}
        <section className="recent-reports">
          <div className="section-heading">
            <div>
              <h2>Your Interview Strategy Blueprints</h2>
              <p className="section-subtext">Access past interview roadmaps, questions, and tailored resumes</p>
            </div>
            
            {reports.length > 0 && (
              <div className="reports-search-wrap">
                <input
                  type="text"
                  placeholder="Filter plans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="reports-search-input"
                />
                <span className="report-count">{filteredReports.length} Plans</span>
              </div>
            )}
          </div>

          {filteredReports && filteredReports.length > 0 ? (
            <div className="reports-grid">
              {filteredReports.map((reportItem) => (
                <div
                  key={reportItem._id}
                  className="report-card"
                  onClick={() => navigate(`/interview/${reportItem._id}`)}
                >
                  <div className="report-card__header">
                    <h3>{reportItem.title || "Target Role Strategy"}</h3>
                    <span
                      className={`score-tag ${
                        reportItem.matchScore >= 80 ? "score--high" : reportItem.matchScore >= 60 ? "score--mid" : "score--low"
                      }`}
                    >
                      {reportItem.matchScore ?? 0}% Match
                    </span>
                  </div>

                  <div className="report-card__footer">
                    <span className="report-meta">
                      Created: {new Date(reportItem.createdAt).toLocaleDateString()}
                    </span>
                    <div className="card-actions">
                      <button
                        type="button"
                        className="delete-report-btn"
                        onClick={(e) => handleDeleteReport(e, reportItem._id)}
                        disabled={deletingId === reportItem._id}
                        title="Delete strategy"
                      >
                        {deletingId === reportItem._id ? "..." : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                        )}
                      </button>
                      <span className="arrow-icon">→</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : reports.length > 0 ? (
            <div className="empty-reports-search">No interview plans match "{searchTerm}"</div>
          ) : (
            <div className="empty-reports-banner">
              <div className="empty-icon">🎯</div>
              <p>No strategy reports created yet. Paste a job description above to generate your first winning interview plan!</p>
            </div>
          )}
        </section>

        {/* Page Footer */}
        <footer className="page-footer">
          <span>&copy; {new Date().getFullYear()} TalentPath AI. Empowering next-generation software careers.</span>
        </footer>

        {/* Screenshot Lightbox Preview Modal */}
        {previewModalImage && (
          <div className="image-lightbox-overlay" onClick={() => setPreviewModalImage(null)}>
            <div className="image-lightbox-modal" onClick={(e) => e.stopPropagation()}>
              <div className="lightbox-header">
                <div className="lightbox-title-wrap">
                  <span className="lightbox-icon">🖼️</span>
                  <h3>{previewModalImage.title}</h3>
                </div>
                <button 
                  type="button" 
                  className="lightbox-close-btn"
                  onClick={() => setPreviewModalImage(null)}
                  title="Close preview"
                >
                  ✕
                </button>
              </div>
              <div className="lightbox-image-wrap">
                <img src={previewModalImage.url} alt={previewModalImage.title} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;