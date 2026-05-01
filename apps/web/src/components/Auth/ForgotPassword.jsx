import { AlertCircle, ArrowLeft, CheckCircle, Mail } from 'lucide-react';
import { useState } from 'react';
import { resetPassword } from '../../services/authService';

const ForgotPassword = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    const { error: resetError } = await resetPassword(email);
    
    if (resetError) {
      setError(resetError.message || 'Failed to send reset email. Please try again.');
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <button className="back-button" onClick={onBack} disabled={loading}>
          <ArrowLeft size={18} /> Back to Login
        </button>

        <div className="auth-header">
          <h1>Reset Password</h1>
          <p className="text-muted">Enter your email to receive a password reset link</p>
        </div>

        {error && (
          <div className="error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="success-banner">
            <CheckCircle size={18} />
            <span>Password reset link sent! Please check your email.</span>
          </div>
        )}

        <form onSubmit={handleResetPassword} className="auth-form">
          <div className="input-group">
            <label>
              <Mail size={14} /> Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading || success}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading || success}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </div>

      <style jsx>{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
          padding: 2rem;
        }

        .auth-card {
          background: var(--bg-card);
          border-radius: 16px;
          padding: 3rem;
          max-width: 440px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          position: relative;
        }

        .back-button {
          position: absolute;
          top: 1.5rem;
          left: 1.5rem;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          padding: 0.5rem;
        }

        .back-button:hover {
          color: var(--primary);
        }

        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
          margin-top: 2rem;
        }

        .auth-header h1 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .error-banner {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid #ef4444;
          color: #ef4444;
          padding: 1rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          font-size: 0.875rem;
        }

        .success-banner {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid var(--accent);
          color: var(--accent);
          padding: 1rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          font-size: 0.875rem;
        }

        .btn-block {
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
