'use client';

import { useEffect, useState } from 'react';
import RequireAuth from '@/components/RequireAuth';
import { useAuth } from '@/src/context/AuthContext';
import api from '@/src/lib/api';
import { User, Mail, Award, Users, UserCheck, Edit2, Camera, Save, TrendingUp } from 'lucide-react';

export default function ProfilePage() {
    const { user, setUser } = useAuth();
    const [stats, setStats] = useState({ followers: 0, following: 0 });
    const [name, setName] = useState('');
    const [avatar, setAvatar] = useState('');
    const [status, setStatus] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setAvatar(user.avatar || '');

            // Fetch stats
            if (!user?.id) return;

            Promise.all([
                api.get(`/users/${user.id}/followers`).catch(() => ({ data: { followers: [] } })),
                api.get(`/users/${user.id}/following`).catch(() => ({ data: { following: [] } })),
            ]).then(([followersRes, followingRes]) => {
                setStats({
                    followers: followersRes.data.followers?.length || 0,
                    following: followingRes.data.following?.length || 0
                });
            });
        }
    }, [user]);

    const save = async (event) => {
        event.preventDefault();
        setSaving(true);
        setStatus('');

        try {
            const res = await api.patch('/auth/me', { name, avatar });
            setUser(res.data.user);
            setStatus('success');
            setIsEditing(false);

            setTimeout(() => setStatus(''), 3000);
        } catch (err) {
            setStatus('error');
        } finally {
            setSaving(false);
        }
    };

    const cancel = () => {
        setName(user?.name || '');
        setAvatar(user?.avatar || '');
        setIsEditing(false);
        setStatus('');
    };

    return (
        <RequireAuth>
            <div className="profile-container">
                {/* Profile Header Card */}
                <div className="profile-header-card">
                    <div className="header-background">
                        <div className="gradient-overlay"></div>
                    </div>

                    <div className="profile-content">
                        <div className="avatar-section">
                            <div className="avatar-wrapper">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt={user?.name} className="avatar-image" />
                                ) : (
                                    <div className="avatar-placeholder">
                                        <User size={48} />
                                    </div>
                                )}
                                {!isEditing && (
                                    <button className="avatar-edit-btn" onClick={() => setIsEditing(true)}>
                                        <Camera size={16} />
                                    </button>
                                )}
                            </div>

                            <div className="user-info">
                                <h1 className="user-name">{user?.name}</h1>
                                <div className="user-meta">
                                    <span className="meta-item">
                                        <Mail size={14} />
                                        {user?.email}
                                    </span>
                                    <span className="meta-item role-badge">
                                        <Award size={14} />
                                        {user?.role}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {!isEditing && (
                            <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                                <Edit2 size={18} />
                                Edit Profile
                            </button>
                        )}
                    </div>

                    {/* Stats Row */}
                    <div className="stats-bar">
                        <div className="stat-item">
                            <TrendingUp size={20} className="stat-icon" />
                            <div className="stat-content">
                                <span className="stat-value">{user?.reputationPoints || 0}</span>
                                <span className="stat-label">Reputation</span>
                            </div>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <Users size={20} className="stat-icon" />
                            <div className="stat-content">
                                <span className="stat-value">{stats.followers}</span>
                                <span className="stat-label">Followers</span>
                            </div>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <UserCheck size={20} className="stat-icon" />
                            <div className="stat-content">
                                <span className="stat-value">{stats.following}</span>
                                <span className="stat-label">Following</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                {isEditing && (
                    <div className="edit-card">
                        <div className="card-header">
                            <h2>
                                <Edit2 size={22} />
                                Edit Profile
                            </h2>
                        </div>

                        <form className="edit-form" onSubmit={save}>
                            <div className="form-group">
                                <label className="form-label">
                                    <User size={16} />
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                    className="form-input"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <Camera size={16} />
                                    Avatar URL
                                </label>
                                <input
                                    type="url"
                                    value={avatar}
                                    onChange={(e) => setAvatar(e.target.value)}
                                    placeholder="https://example.com/avatar.jpg"
                                    className="form-input"
                                />
                                <span className="form-hint">
                                    Provide a URL to an image that represents you
                                </span>
                            </div>

                            {/* Preview */}
                            {avatar && (
                                <div className="avatar-preview">
                                    <span className="preview-label">Preview:</span>
                                    <img src={avatar} alt="Avatar preview" className="preview-image" />
                                </div>
                            )}

                            {status && (
                                <div className={`status-message ${status}`}>
                                    {status === 'success' ? (
                                        <>
                                            <Save size={18} />
                                            Profile updated successfully!
                                        </>
                                    ) : (
                                        <>
                                            <Edit2 size={18} />
                                            Failed to update profile. Please try again.
                                        </>
                                    )}
                                </div>
                            )}

                            <div className="form-actions">
                                <button
                                    type="button"
                                    onClick={cancel}
                                    className="cancel-btn"
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="save-btn"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <span className="spinner"></span>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            <style jsx>{`
        .profile-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* Profile Header Card */
        .profile-header-card {
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
        }

        .header-background {
          height: 180px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
        }

        .gradient-overlay {
          position: absolute;
          inset: 0;
          background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
          opacity: 0.3;
        }

        .profile-content {
          padding: 0 2rem 1.5rem 2rem;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-top: -60px;
          position: relative;
        }

        .avatar-section {
          display: flex;
          gap: 1.5rem;
          align-items: flex-end;
        }

        .avatar-wrapper {
          position: relative;
        }

        .avatar-image,
        .avatar-placeholder {
          width: 140px;
          height: 140px;
          border-radius: 50%;
          border: 6px solid white;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .avatar-image {
          object-fit: cover;
        }

        .avatar-placeholder {
          background: linear-gradient(135deg, #cbd5e0 0%, #a0aec0 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .avatar-edit-btn {
          position: absolute;
          bottom: 10px;
          right: 10px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: white;
          border: 2px solid #667eea;
          color: #667eea;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .avatar-edit-btn:hover {
          background: #667eea;
          color: white;
          transform: scale(1.1);
        }

        .user-info {
          padding-bottom: 0.5rem;
        }

        .user-name {
          font-size: 2rem;
          font-weight: 700;
          color: #1a202c;
          margin: 0 0 0.5rem 0;
        }

        .user-meta {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.875rem;
          color: #718096;
        }

        .role-badge {
          background: #edf2f7;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          color: #4a5568;
          font-weight: 600;
          text-transform: capitalize;
        }

        .edit-profile-btn {
          padding: 0.75rem 1.5rem;
          background: white;
          border: 2px solid #667eea;
          color: #667eea;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
          margin-bottom: 0.5rem;
        }

        .edit-profile-btn:hover {
          background: #667eea;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        /* Stats Bar */
        .stats-bar {
          display: flex;
          padding: 1.5rem 2rem;
          background: #f7fafc;
          border-top: 1px solid #e2e8f0;
        }

        .stat-item {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stat-icon {
          color: #667eea;
          flex-shrink: 0;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2d3748;
          line-height: 1;
        }

        .stat-label {
          font-size: 0.813rem;
          color: #a0aec0;
          margin-top: 0.25rem;
        }

        .stat-divider {
          width: 1px;
          background: #e2e8f0;
          margin: 0 1rem;
        }

        /* Edit Card */
        .edit-card {
          background: white;
          border-radius: 24px;
          padding: 2rem;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .card-header h2 {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.5rem;
          font-weight: 600;
          color: #2d3748;
          margin: 0 0 1.5rem 0;
        }

        /* Form */
        .edit-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #4a5568;
        }

        .form-input {
          padding: 0.875rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.2s;
          font-family: inherit;
        }

        .form-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-hint {
          font-size: 0.75rem;
          color: #a0aec0;
        }

        /* Avatar Preview */
        .avatar-preview {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f7fafc;
          border-radius: 12px;
        }

        .preview-label {
          font-size: 0.875rem;
          color: #718096;
          font-weight: 600;
        }

        .preview-image {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        /* Status Message */
        .status-message {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .status-message.success {
          background: #d4edda;
          color: #155724;
        }

        .status-message.error {
          background: #f8d7da;
          color: #721c24;
        }

        /* Form Actions */
        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1rem;
        }

        .cancel-btn,
        .save-btn {
          padding: 0.875rem 1.75rem;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border: none;
        }

        .cancel-btn {
          background: #edf2f7;
          color: #4a5568;
        }

        .cancel-btn:hover:not(:disabled) {
          background: #e2e8f0;
        }

        .save-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .save-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .cancel-btn:disabled,
        .save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .profile-container {
            padding: 1rem;
          }

          .profile-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
            padding: 0 1.5rem 1.5rem 1.5rem;
          }

          .avatar-section {
            flex-direction: column;
            align-items: center;
            width: 100%;
            text-align: center;
          }

          .user-meta {
            justify-content: center;
          }

          .edit-profile-btn {
            width: 100%;
            justify-content: center;
          }

          .stats-bar {
            flex-direction: column;
            gap: 1rem;
            padding: 1.5rem;
          }

          .stat-divider {
            display: none;
          }

          .edit-card {
            padding: 1.5rem;
          }

          .form-actions {
            flex-direction: column-reverse;
          }

          .cancel-btn,
          .save-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
        </RequireAuth>
    );
}
