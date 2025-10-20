import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Mail, Lock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
export default function AuthPage() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/auth';
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isSignUp) {
                const res = await axios.post(`${API_BASE}/register`, {
                    email,
                    password,
                    username,
                });
                const { token } = res.data;
                localStorage.setItem('token', token);
                navigate('/');
            }
            else {
                const res = await axios.post(`${API_BASE}/login`, { email, password });
                const { token } = res.data;
                localStorage.setItem('token', token);
                navigate('/');
            }
        }
        catch (err) {
            setError(err.response?.data?.message || err.message || 'An error occurred');
        }
        finally {
            setLoading(false);
        }
    };
    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);
        try {
            window.location.href = `${API_BASE}/google`;
        }
        catch (err) {
            setError(err.message || 'An error occurred');
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-green-50 p-4", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-2xl w-full max-w-md p-8", children: [_jsxs("div", { className: "text-center mb-6", children: [_jsx("div", { className: "text-5xl mb-3", children: "\uD83C\uDF31" }), _jsx("h2", { className: "text-2xl font-bold text-green-800", children: isSignUp ? 'Create Account' : 'Welcome Back' }), _jsx("p", { className: "text-green-600 mt-1", children: isSignUp ? 'Join Demeter today' : 'Sign in to continue' })] }), error && (_jsx("div", { className: "mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm", children: error })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [isSignUp && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-green-700 mb-1", children: "Username" }), _jsxs("div", { className: "relative", children: [_jsx(User, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500", size: 18 }), _jsx("input", { type: "text", value: username, onChange: (e) => setUsername(e.target.value), required: true, placeholder: "John Doe", className: "w-full pl-10 pr-4 py-2 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-500 transition-colors" })] })] })), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-green-700 mb-1", children: "Email" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500", size: 18 }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true, placeholder: "you@example.com", className: "w-full pl-10 pr-4 py-2 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-500 transition-colors" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-green-700 mb-1", children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500", size: 18 }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, minLength: 6, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", className: "w-full pl-10 pr-4 py-2 border-2 border-green-200 rounded-lg focus:outline-none focus:border-green-500 transition-colors" })] })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed", children: loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In' })] }), _jsx("div", { className: "mt-4 text-center", children: _jsx("button", { onClick: () => setIsSignUp(!isSignUp), className: "text-green-600 hover:text-green-700 font-medium transition-colors", children: isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up" }) }), _jsx("div", { className: "mt-6 text-center", children: _jsxs("button", { onClick: handleGoogleSignIn, disabled: loading, className: "w-full py-3 border-2 border-green-200 text-green-700 rounded-lg hover:bg-green-50 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed", children: [_jsxs("svg", { className: "w-5 h-5", viewBox: "0 0 24 24", children: [_jsx("path", { fill: "#4285F4", d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" }), _jsx("path", { fill: "#34A853", d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" }), _jsx("path", { fill: "#FBBC05", d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" }), _jsx("path", { fill: "#EA4335", d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" })] }), "Sign in with Google"] }) })] }) }));
}
