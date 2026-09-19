import { useState } from 'react';
import { MessageSquare, X, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../api/axios';

export default function FeedbackModal({ isOpen, onClose }) {
  const [type, setType] = useState('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await api.post('/feedback', { type, subject, message });

      setSuccess(true);
      setSubject('');
      setMessage('');
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-darkSurface-card border border-neutral-200 dark:border-darkSurface-border rounded-xl shadow-xl w-full max-w-md overflow-hidden transition-all">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-neutral-200 dark:border-darkSurface-border flex justify-between items-center bg-neutral-50 dark:bg-darkSurface-surface">
          <div className="flex items-center gap-2 text-primary-700 dark:text-primary-400 font-semibold">
            <MessageSquare className="w-5 h-5" />
            <span>Submit Feedback & Support</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-darkSurface-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {success ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-primary-600 dark:text-primary-400 mx-auto animate-bounce" />
              <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">Thank You!</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Your concern/feedback has been submitted successfully. Our team will review it.
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 text-status-danger border border-red-200 dark:border-red-800/50 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Category
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-darkSurface-surface text-neutral-900 dark:text-neutral-100 border border-neutral-300 dark:border-darkSurface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 dark:focus:ring-primary-400"
                >
                  <option value="general" className="bg-white dark:bg-darkSurface-card text-neutral-900 dark:text-neutral-100">General Feedback</option>
                  <option value="bug" className="bg-white dark:bg-darkSurface-card text-neutral-900 dark:text-neutral-100">Report a Bug / Issue</option>
                  <option value="feature" className="bg-white dark:bg-darkSurface-card text-neutral-900 dark:text-neutral-100">Feature Request</option>
                  <option value="complaint" className="bg-white dark:bg-darkSurface-card text-neutral-900 dark:text-neutral-100">Store / Dealer Concern</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief summary of your concern"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-darkSurface-surface text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 border border-neutral-300 dark:border-darkSurface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 dark:focus:ring-primary-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Message / Details
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue or feedback in detail..."
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-darkSurface-surface text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 border border-neutral-300 dark:border-darkSurface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 dark:focus:ring-primary-400"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-darkSurface-hover border border-neutral-300 dark:border-darkSurface-border rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {loading ? 'Submitting...' : 'Send Feedback'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
