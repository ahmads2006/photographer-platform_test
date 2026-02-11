'use client';

import { useEffect, useState } from 'react';
import RequireAuth from '@/components/RequireAuth';
import api from '@/src/lib/api';
import { Album, Lock, Unlock, Users, Plus, Image as ImageIcon } from 'lucide-react';

export default function AlbumsPage() {
    const [albums, setAlbums] = useState([]);
    const [name, setName] = useState('');
    const [privacy, setPrivacy] = useState('private');
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    const loadAlbums = async () => {
        try {
            const res = await api.get('/albums');
            setAlbums(res.data.albums || []);
        } catch (err) {
            console.error(err);
            setAlbums([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAlbums();
    }, []);

    const createAlbum = async (event) => {
        event.preventDefault();
        setCreating(true);

        try {
            await api.post('/albums', { name, privacy, members: [] });
            setName('');
            await loadAlbums();
        } catch (err) {
            console.error(err);
        } finally {
            setCreating(false);
        }
    };

    return (
        <RequireAuth>
            <div className="albums-container">
                <div className="albums-header">
                    <h1 className="title">
                        <Album size={28} />
                        Photo Albums
                    </h1>
                    <p className="subtitle">Organize your photos into collections</p>
                </div>

                <div className="content-grid">
                    {/* Create Album Form */}
                    <div className="create-card">
                        <h2 className="card-title">
                            <Plus size={22} />
                            Create New Album
                        </h2>

                        <form className="create-form" onSubmit={createAlbum}>
                            <div className="form-group">
                                <label>Album Name</label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Summer 2024"
                                    required
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Privacy</label>
                                <div className="privacy-options">
                                    <button
                                        type="button"
                                        className={`privacy-btn ${privacy === 'private' ? 'active' : ''}`}
                                        onClick={() => setPrivacy('private')}
                                    >
                                        <Lock size={18} />
                                        Private
                                    </button>
                                    <button
                                        type="button"
                                        className={`privacy-btn ${privacy === 'public' ? 'active' : ''}`}
                                        onClick={() => setPrivacy('public')}
                                    >
                                        <Unlock size={18} />
                                        Public
                                    </button>
                                </div>
                            </div>

                            <button type="submit" className="submit-btn" disabled={creating}>
                                {creating ? (
                                    <>
                                        <span className="spinner"></span>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Plus size={20} />
                                        Create Album
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Albums List */}
                    <div className="albums-list-card">
                        <h2 className="card-title">
                            <ImageIcon size={22} />
                            Your Albums
                        </h2>

                        {loading ? (
                            <div className="loading-albums">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="skeleton-album"></div>
                                ))}
                            </div>
                        ) : albums.length === 0 ? (
                            <div className="empty-albums">
                                <Album size={48} />
                                <p>No albums yet</p>
                                <span>Create your first album to get started</span>
                            </div>
                        ) : (
                            <div className="albums-grid">
                                {albums.map((album, index) => (
                                    <div
                                        key={album._id}
                                        className="album-item"
                                        style={{ animationDelay: `${index * 0.08}s` }}
                                    >
                                        <div className="album-icon">
                                            <Album size={24} />
                                        </div>
                                        <div className="album-info">
                                            <h3 className="album-name">{album.name}</h3>
                                            <div className="album-meta">
                                                <span className={`privacy-badge ${album.privacy}`}>
                                                    {album.privacy === 'private' ? <Lock size={12} /> : <Unlock size={12} />}
                                                    {album.privacy}
                                                </span>
                                                <span className="members-count">
                                                    <Users size={12} />
                                                    {album.members?.length || 0}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <style jsx>{`
          .albums-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
          }

          .albums-header {
            margin-bottom: 2rem;
          }

          .title {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-size: 2rem;
            font-weight: 700;
            color: #1a202c;
            margin: 0 0 0.5rem 0;
          }

          .subtitle {
            color: #718096;
            margin: 0;
          }

          .content-grid {
            display: grid;
            grid-template-columns: 400px 1fr;
            gap: 2rem;
          }

          .create-card,
          .albums-list-card {
            background: white;
            border-radius: 16px;
            padding: 2rem;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
          }

          .create-card {
            height: fit-content;
          }

          .card-title {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-size: 1.25rem;
            font-weight: 600;
            color: #2d3748;
            margin: 0 0 1.5rem 0;
          }

          .create-form {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }

          .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .form-group label {
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

          .privacy-options {
            display: flex;
            gap: 0.75rem;
          }

          .privacy-btn {
            flex: 1;
            padding: 0.875rem;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            background: white;
            color: #718096;
            font-weight: 600;
            font-size: 0.875rem;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
          }

          .privacy-btn:hover {
            border-color: #cbd5e0;
          }

          .privacy-btn.active {
            border-color: #667eea;
            background: #eef2ff;
            color: #667eea;
          }

          .submit-btn {
            padding: 1rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
          }

          .submit-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
          }

          .submit-btn:disabled {
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

          .albums-grid {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }

          .album-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            border-radius: 12px;
            background: #f7fafc;
            transition: all 0.2s;
            animation: fadeInSlide 0.3s ease forwards;
            opacity: 0;
          }

          .album-item:hover {
            background: #edf2f7;
            transform: translateX(4px);
          }

          @keyframes fadeInSlide {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          .album-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .album-info {
            flex: 1;
            min-width: 0;
          }

          .album-name {
            font-size: 1rem;
            font-weight: 600;
            color: #2d3748;
            margin: 0 0 0.375rem 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .album-meta {
            display: flex;
            gap: 1rem;
            font-size: 0.75rem;
          }

          .privacy-badge,
          .members-count {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            color: #a0aec0;
            text-transform: capitalize;
          }

          .privacy-badge.private {
            color: #ed8936;
          }

          .privacy-badge.public {
            color: #48bb78;
          }

          .empty-albums {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 3rem 2rem;
            color: #a0aec0;
            text-align: center;
          }

          .empty-albums p {
            margin: 1rem 0 0.25rem 0;
            font-size: 1rem;
            font-weight: 600;
            color: #718096;
          }

          .empty-albums span {
            font-size: 0.875rem;
          }

          .loading-albums {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }

          .skeleton-album {
            height: 68px;
            border-radius: 12px;
            background: linear-gradient(90deg, #edf2f7 25%, #e2e8f0 50%, #edf2f7 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }

          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }

          @media (max-width: 968px) {
            .albums-container {
              padding: 1rem;
            }

            .content-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
            </div>
        </RequireAuth>
    );
}
