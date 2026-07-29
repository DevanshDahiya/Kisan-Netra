import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function ForgotPassword() {
    const [step, setStep] = useState(1); // 1 = enter email, 2 = enter OTP + new password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const res = await api.post('/auth/forgot-password', { email });
            setMessage(res.data.message);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await api.post('/auth/reset-password', { email, otp, newPassword });
            navigate('/login'); // redirect to login so they can sign in with new password
        } catch (err) {
            setError(err.response?.data?.message || 'Reset failed. Please check your OTP and try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-sm mx-auto mt-16 bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-green-800 mb-6 text-center">Reset Password</h2>

            {error && (
                <div className="bg-red-100 text-red-700 text-sm rounded px-3 py-2 mb-4">{error}</div>
            )}
            {message && step === 2 && (
                <div className="bg-green-100 text-green-700 text-sm rounded px-3 py-2 mb-4">{message}</div>
            )}

            {step === 1 ? (
                <form onSubmit={handleRequestOTP} className="flex flex-col gap-4">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                    <button
                        type="submit"
                        disabled={submitting}
                        className="bg-green-700 text-white rounded py-2 hover:bg-green-800 transition disabled:opacity-50"
                    >
                        {submitting ? 'Sending...' : 'Send OTP'}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                        maxLength={6}
                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                    <input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                    <button
                        type="submit"
                        disabled={submitting}
                        className="bg-green-700 text-white rounded py-2 hover:bg-green-800 transition disabled:opacity-50"
                    >
                        {submitting ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            )}
        </div>
    );
}