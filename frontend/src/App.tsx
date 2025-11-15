
import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { useQueryClient } from '@tanstack/react-query';

import ProtectedRoute from './components/ProtectedRoute';

// 1. IMPORT HOOK `useAuth`
import { useAuth } from './auth/auth'; 

export default function App() {

  const { isAuthenticated, logout } = useAuth();
  const queryClient = useQueryClient();
  const handleLogout = () => {
    logout();
    queryClient.invalidateQueries({ queryKey: ['profile'] });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-slate-50 to-slate-100">
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-30 border-b">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center text-white font-bold">UR</div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">User Registration</h1>
              <p className="text-xs text-slate-500">Simple auth demo</p>
            </div>
          </Link>

      
          <nav className="flex items-center gap-3">
            <Link to="/" className="text-sm text-slate-700 hover:text-blue-600">Home</Link>
            {isAuthenticated ? (
    
              <>
                <Link to="/dashboard" className="text-sm text-slate-700 hover:text-blue-600">Dashboard</Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm px-4 py-2 rounded shadow-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-slate-700 hover:text-blue-600">Login</Link>
                <Link to="/register" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded shadow-sm">
                  Sign Up
                </Link>
              </>
            )}
          </nav>

        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </main>

      <footer className="bg-transparent border-t">
        <div className="max-w-5xl mx-auto px-6 py-6 text-sm text-slate-500 flex items-center justify-between">
          <span>© {new Date().getFullYear()} User Registration</span>
          <span>Built with React • NestJS • MongoDB</span>
        </div>
      </footer>
    </div>
  );
}


