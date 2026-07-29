import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContent';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await login(email, password);
            navigate('/'); // redirect to home/dashboard on success
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-sm mx-auto mt-16 bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-green-800 mb-6 text-center">Login</h2>

            {error && (
                <div className="bg-red-100 text-red-700 text-sm rounded px-3 py-2 mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                />
                <button
                    type="submit"
                    disabled={submitting}
                    className="bg-green-700 text-white rounded py-2 hover:bg-green-800 transition disabled:opacity-50"
                >
                    {submitting ? 'Logging in...' : 'Login'}
                </button>
            </form>

            <div className="flex justify-between mt-4 text-sm">
                <Link to="/forgot-password" className="text-green-700 hover:underline">
                    Forgot password?
                </Link>
                <Link to="/register" className="text-green-700 hover:underline">
                    Create account
                </Link>
            </div>
        </div>
    );
}