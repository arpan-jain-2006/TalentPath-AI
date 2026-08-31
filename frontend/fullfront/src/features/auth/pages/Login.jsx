import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import "../auth.form.scss";

const Login = () => {
  const { loading, handleLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await handleLogin({ email, password });
      navigate("/");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="login-page">
        <div className="loader-container">
          <div className="spinner"></div>
          <p>Authenticating...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="login-page">
      {/* Background glowing orbs for visual depth */}
      <div className="glow-orb orb-1"></div>
      <div className="glow-orb orb-2"></div>

      <div className="form-container">
        <div className="form-header">
          <h1 className="form-title">Welcome Back <span className="wave">👋</span></h1>
          <p className="form-subtitle">Please enter your credentials to continue</p>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="email"
                id="email"
                name="email"
                placeholder="name@example.com"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="input-group">
            <div className="label-row">
              <label htmlFor="password">Password</label>
            </div>
            <div className="input-wrapper">
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className={`button primary-button ${isSubmitting ? "loading" : ""}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? <span className="button-spinner"></span> : "Sign In"}
          </button>
        </form>

        <p className="form-footer">
          Don’t have an account? <Link to="/register" className="auth-link">Create Account</Link>
        </p>
      </div>
    </main>
  );
};

export default Login;