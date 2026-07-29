import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On mount , check if a valid seesion cookie already exists(e.g. after page refresh)
    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await api.get('/auth/me');
                setUser(res.data.user);
            }
            catch (err) {
                setUser(null); // no valid session - that's fine, just means logged out 
            }
            finally {
                setLoading(false);
            }
        };
        checkSession();
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        setUser(res.data.user);
        return res.data.user;
    };

    const register = async (name, email, password, role) => {
        const res = await api.post('/auth/register', { name, email, password, role });
        setUser(res.data.user);
        return res.data.user;
    };

    const logout = () => {
        setUser(null);
        // Note: this only clears client-side state. A real logout should also call
        // a backend endpoint to clear the httpOnly cookie - add this on Day 4.
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}


export const useAuth = () => useContext(AuthContext);