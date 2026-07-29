import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContent';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('farmer');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await register(name, email, password, role);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-sm mx-auto mt-16 bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-green-800 mb-6 text-center">Create Account</h2>

            {error && (
                <div className="bg-red-100 text-red-700 text-sm rounded px-3 py-2 mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                />
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
                    minLength={6}
                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                />
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                >
                    <option value="farmer">Farmer</option>
                    <option value="dealer">Dealer</option>
                </select>
                <button
                    type="submit"
                    disabled={submitting}
                    className="bg-green-700 text-white rounded py-2 hover:bg-green-800 transition disabled:opacity-50"
                >
                    {submitting ? 'Creating account...' : 'Register'}
                </button>
            </form>
        </div>
    );
}