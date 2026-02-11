'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" href="/">PhotoShare</Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">

            <li className="nav-item">
              <Link className="nav-link" href="/contact">Contact</Link>
            </li>

            {user && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" href="/dashboard">Dashboard</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/feed">Feed</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/gallery">Gallery</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/chat">Chat</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/notifications">Notifications</Link>
                </li>

                {/* Admin Links */}
                {['admin', 'super_admin'].includes(user.role) && (
                  <li className="nav-item">
                    <Link
                      className="nav-link"
                      href="/admin/dashboard"
                      style={{ color: '#ff4444' }}
                    >
                      Admin
                    </Link>
                  </li>
                )}
                {user.role === 'super_admin' && (
                  <li className="nav-item">
                    <Link
                      className="nav-link"
                      href="/super-admin/dashboard"
                      style={{ color: '#ff0000', fontWeight: 'bold' }}
                    >
                      Super Admin
                    </Link>
                  </li>
                )}
              </>
            )}
          </ul>

          <ul className="navbar-nav">
            {user ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" href="/profile">
                    {user.name || 'Profile'}
                  </Link>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-outline-light ms-2"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" href="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" href="/register">Register</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
