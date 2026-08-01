import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContent';

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="bg-green-700 text-white px-6 py-4 flex justify-between items-center">
            <Link to="/" className="text-xl font-bold">Kisan Netra</Link>
            <div className="flex gap-4 items-center">
                {user ? (
                    <>
                        {user.role === 'dealer' && (
                            <Link to="/dealers/dashboard" className='hover:underline'>My Store</Link>
                        )}
                        <span className="text-sm">Welcome, {user.name}</span>
                        <button
                            onClick={logout}
                            className="bg-green-900 hover:bg-green-800 px-3 py-2 rounded transition"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="hover:underline">Login</Link>
                        <Link to="/register" className="hover:underline">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
}