'use client';

import { useEffect, useState } from 'react';
import api from '@/src/lib/api';
import RequireAuth from '@/components/RequireAuth';
import LikeButton from '@/src/components/LikeButton';
import CommentSection from '@/src/components/CommentSection';
import Link from 'next/link';
import { Heart, MessageCircle, Share2, UserPlus, Users, TrendingUp } from 'lucide-react';

export default function FeedPage() {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('recent'); // recent, popular, following

    useEffect(() => {
        api.get('/users/feed')
            .then(res => setPhotos(res.data.photos || []))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const SuggestedUsers = () => {
        const [users, setUsers] = useState([]);
        const [followingStates, setFollowingStates] = useState({});

        useEffect(() => {
            api.get('/users/collaborators')
                .then(res => setUsers(res.data.users || []))
                .catch(err => console.error(err));
        }, []);

        const handleFollow = async (id) => {
            setFollowingStates(prev => ({ ...prev, [id]: 'loading' }));

            try {
                await api.post(`/users/${id}/follow`);
                setFollowingStates(prev => ({ ...prev, [id]: 'followed' }));

                // Remove user from list after successful follow
                setTimeout(() => {
                    setUsers(users.filter(u => u._id !== id));
                }, 600);
            } catch (err) {
                setFollowingStates(prev => ({ ...prev, [id]: 'error' }));
                setTimeout(() => {
                    setFollowingStates(prev => ({ ...prev, [id]: undefined }));
                }, 2000);
            }
        };

        if (users.length === 0) return null;

        return (
            <div className="suggested-users-card">
                <div className="card-header">
                    <Users size={20} />
                    <h3>Who to Follow</h3>
                </div>

                <div className="users-list">
                    {users.map(u => (
                        <div key={u._id} className="user-item">
                            <div className="user-info">
                                <div className="avatar">
                                    {u.avatar ? (
                                        <img src={u.avatar} alt={u.name} />
                                    ) : (
                                        <div className="avatar-placeholder">
                                            {u.name?.charAt(0)?.toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="user-details">
                                    <span className="user-name">{u.name}</span>
                                    <span className="user-role">Photographer</span>
                                </div>
                            </div>

                            <button
                                onClick={() => handleFollow(u._id)}
                                className={`follow-btn ${followingStates[u._id] || ''}`}
                                disabled={followingStates[u._id] === 'loading'}
                            >
                                {followingStates[u._id] === 'loading' ? (
                                    <span className="spinner-small"></span>
                                ) : followingStates[u._id] === 'followed' ? (
                                    'Followed!'
                                ) : (
                                    <>
                                        <UserPlus size={16} />
                                        Follow
                                    </>
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <RequireAuth>
            <div className="feed-container">
                {/* Header */}
                <div className="feed-header">
                    <h1 className="feed-title">
                        <TrendingUp size={28} />
                        Your Feed
                    </h1>

                    {/* Filter Tabs */}
                    <div className="filter-tabs">
                        <button
                            className={`filter-tab ${filter === 'recent' ? 'active' : ''}`}
                            onClick={() => setFilter('recent')}
                        >
                            Recent
                        </button>
                        <button
                            className={`filter-tab ${filter === 'popular' ? 'active' : ''}`}
                            onClick={() => setFilter('popular')}
                        >
                            Popular
                        </button>
                        <button
                            className={`filter-tab ${filter === 'following' ? 'active' : ''}`}
                            onClick={() => setFilter('following')}
                        >
                            Following
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="skeleton-card">
                                <div className="skeleton-header">
                                    <div className="skeleton-avatar"></div>
                                    <div className="skeleton-text-group">
                                        <div className="skeleton-text"></div>
                                        <div className="skeleton-text-small"></div>
                                    </div>
                                </div>
                                <div className="skeleton-image"></div>
                                <div className="skeleton-footer"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="feed-layout">
                        {/* Main Feed */}
                        <div className="feed-main">
                            {photos.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">
                                        <TrendingUp size={64} />
                                    </div>
                                    <h3>No posts yet!</h3>
                                    <p>Follow photographers to see their amazing work here.</p>
                                    <Link href="/gallery" className="explore-btn">
                                        Explore Gallery
                                    </Link>
                                </div>
                            ) : (
                                photos.map((photo, index) => (
                                    <article key={photo.id} className="feed-card" style={{ animationDelay: `${index * 0.1}s` }}>
                                        {/* Card Header */}
                                        <div className="card-user-header">
                                            <Link href={`/users/${photo.owner?.id}`} className="user-link">
                                                <div className="user-avatar">
                                                    {photo.owner?.avatar ? (
                                                        <img src={photo.owner.avatar} alt={photo.owner.name} />
                                                    ) : (
                                                        <div className="avatar-placeholder">
                                                            {photo.owner?.name?.charAt(0)?.toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="user-text">
                                                    <strong className="user-name">{photo.owner?.name}</strong>
                                                    <span className="post-time">{new Date(photo.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </Link>
                                        </div>

                                        {/* Photo */}
                                        <div className="photo-container">
                                            <img
                                                src={photo.imageUrl}
                                                alt={photo.metadataTitle}
                                                className="feed-photo"
                                                loading="lazy"
                                            />
                                        </div>

                                        {/* Actions */}
                                        <div className="card-actions">
                                            <LikeButton
                                                photoId={photo.id}
                                                initialCount={photo.Likes?.length || 0}
                                                initialLiked={false}
                                            />
                                            <button className="action-btn">
                                                <MessageCircle size={22} />
                                                <span>{photo.Comments?.length || 0}</span>
                                            </button>
                                            <button className="action-btn">
                                                <Share2 size={22} />
                                            </button>
                                        </div>

                                        {/* Content */}
                                        <div className="card-content">
                                            <p className="photo-caption">
                                                <strong>{photo.metadataTitle}</strong>
                                                {photo.metadataDescription && (
                                                    <span className="description">{photo.metadataDescription}</span>
                                                )}
                                            </p>
                                        </div>

                                        {/* Comments */}
                                        <CommentSection
                                            photoId={photo.id}
                                            initialComments={photo.Comments || []}
                                        />
                                    </article>
                                ))
                            )}
                        </div>

                        {/* Sidebar */}
                        <aside className="feed-sidebar">
                            <SuggestedUsers />

                            {/* Trending Tags */}
                            <div className="trending-card">
                                <div className="card-header">
                                    <TrendingUp size={20} />
                                    <h3>Trending Tags</h3>
                                </div>
                                <div className="tags-list">
                                    {['#Portrait', '#Landscape', '#Street', '#Nature', '#Urban'].map(tag => (
                                        <button key={tag} className="tag-btn">{tag}</button>
                                    ))}
                                </div>
                            </div>
                        </aside>
                    </div>
                )}

                <style jsx>{`
          .feed-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
          }

          /* Header */
          .feed-header {
            margin-bottom: 2rem;
          }

          .feed-title {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-size: 2rem;
            font-weight: 700;
            color: #1a202c;
            margin: 0 0 1.5rem 0;
          }

          /* Filter Tabs */
          .filter-tabs {
            display: flex;
            gap: 0.5rem;
            background: white;
            padding: 0.5rem;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            width: fit-content;
          }

          .filter-tab {
            padding: 0.625rem 1.25rem;
            border: none;
            background: transparent;
            color: #718096;
            font-weight: 600;
            font-size: 0.875rem;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
          }

          .filter-tab:hover {
            background: #edf2f7;
            color: #4a5568;
          }

          .filter-tab.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }

          /* Layout */
          .feed-layout {
            display: grid;
            grid-template-columns: 1fr 340px;
            gap: 2rem;
            align-items: start;
          }

          .feed-main {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }

          /* Feed Card */
          .feed-card {
            background: white;
            border-radius: 16px;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
            overflow: hidden;
            animation: fadeInUp 0.4s ease forwards;
            opacity: 0;
            transition: transform 0.2s, box-shadow 0.2s;
          }

          .feed-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          /* Card Header */
          .card-user-header {
            padding: 1rem 1.25rem;
          }

          .user-link {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            text-decoration: none;
            color: inherit;
          }

          .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            overflow: hidden;
            flex-shrink: 0;
          }

          .user-avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .avatar-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-weight: 600;
          }

          .user-text {
            display: flex;
            flex-direction: column;
          }

          .user-name {
            font-weight: 600;
            color: #2d3748;
            font-size: 0.938rem;
          }

          .post-time {
            font-size: 0.75rem;
            color: #a0aec0;
          }

          /* Photo */
          .photo-container {
            width: 100%;
            max-height: 600px;
            overflow: hidden;
            background: #f7fafc;
          }

          .feed-photo {
            width: 100%;
            height: auto;
            display: block;
            object-fit: contain;
          }

          /* Actions */
          .card-actions {
            display: flex;
            gap: 1rem;
            padding: 0.75rem 1.25rem;
            border-bottom: 1px solid #edf2f7;
          }

          .action-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background: none;
            border: none;
            color: #718096;
            cursor: pointer;
            font-size: 0.875rem;
            font-weight: 500;
            padding: 0.5rem;
            border-radius: 8px;
            transition: all 0.2s;
          }

          .action-btn:hover {
            background: #edf2f7;
            color: #4a5568;
          }

          /* Content */
          .card-content {
            padding: 1rem 1.25rem;
          }

          .photo-caption {
            margin: 0;
            color: #2d3748;
            line-height: 1.6;
          }

          .photo-caption strong {
            font-weight: 600;
            margin-right: 0.5rem;
          }

          .description {
            color: #4a5568;
          }

          /* Sidebar */
          .feed-sidebar {
            position: sticky;
            top: 2rem;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }

          /* Suggested Users Card */
          .suggested-users-card,
          .trending-card {
            background: white;
            border-radius: 16px;
            padding: 1.25rem;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
          }

          .card-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
          }

          .card-header h3 {
            margin: 0;
            font-size: 1rem;
            font-weight: 600;
            color: #2d3748;
          }

          .users-list {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }

          .user-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.5rem;
            border-radius: 8px;
            transition: background 0.2s;
          }

          .user-item:hover {
            background: #f7fafc;
          }

          .user-info {
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }

          .avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            overflow: hidden;
            flex-shrink: 0;
          }

          .avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .user-details {
            display: flex;
            flex-direction: column;
          }

          .user-name {
            font-weight: 600;
            font-size: 0.875rem;
            color: #2d3748;
          }

          .user-role {
            font-size: 0.75rem;
            color: #a0aec0;
          }

          .follow-btn {
            display: flex;
            align-items: center;
            gap: 0.375rem;
            padding: 0.5rem 1rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 0.813rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          .follow-btn:hover:not(:disabled) {
            transform: scale(1.05);
          }

          .follow-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }

          .follow-btn.followed {
            background: #48bb78;
          }

          .spinner-small {
            width: 14px;
            height: 14px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.6s linear infinite;
          }

          /* Trending Tags */
          .tags-list {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
          }

          .tag-btn {
            padding: 0.5rem 1rem;
            background: #edf2f7;
            border: none;
            border-radius: 20px;
            color: #4a5568;
            font-size: 0.813rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          }

          .tag-btn:hover {
            background: #667eea;
            color: white;
          }

          /* Empty State */
          .empty-state {
            background: white;
            border-radius: 16px;
            padding: 4rem 2rem;
            text-align: center;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
          }

          .empty-icon {
            color: #cbd5e0;
            margin-bottom: 1.5rem;
          }

          .empty-state h3 {
            font-size: 1.5rem;
            font-weight: 600;
            color: #2d3748;
            margin: 0 0 0.5rem 0;
          }

          .empty-state p {
            color: #718096;
            margin: 0 0 1.5rem 0;
          }

          .explore-btn {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 10px;
            font-weight: 600;
            transition: transform 0.2s;
          }

          .explore-btn:hover {
            transform: scale(1.05);
          }

          /* Loading State */
          .loading-state {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }

          .skeleton-card {
            background: white;
            border-radius: 16px;
            padding: 1rem;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
          }

          .skeleton-header {
            display: flex;
            gap: 0.75rem;
            margin-bottom: 1rem;
          }

          .skeleton-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(90deg, #edf2f7 25%, #e2e8f0 50%, #edf2f7 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }

          .skeleton-text-group {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .skeleton-text,
          .skeleton-text-small {
            height: 12px;
            border-radius: 4px;
            background: linear-gradient(90deg, #edf2f7 25%, #e2e8f0 50%, #edf2f7 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }

          .skeleton-text {
            width: 60%;
          }

          .skeleton-text-small {
            width: 40%;
          }

          .skeleton-image {
            width: 100%;
            height: 300px;
            border-radius: 12px;
            background: linear-gradient(90deg, #edf2f7 25%, #e2e8f0 50%, #edf2f7 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            margin-bottom: 1rem;
          }

          skeleton-footer {
            height: 40px;
            border-radius: 8px;
            background: linear-gradient(90deg, #edf2f7 25%, #e2e8f0 50%, #edf2f7 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }

          @keyframes shimmer {
            0% {
              background-position: 200% 0;
            }
            100% {
              background-position: -200% 0;
            }
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          /* Responsive */
          @media (max-width: 1024px) {
            .feed-layout {
              grid-template-columns: 1fr;
            }

            .feed-sidebar {
              position: static;
            }
          }

          @media (max-width: 768px) {
            .feed-container {
              padding: 1rem;
            }

            .feed-title {
              font-size: 1.5rem;
            }

            .filter-tabs {
              width: 100%;
            }

            .filter-tab {
              flex: 1;
              padding: 0.5rem 0.75rem;
            }
          }
        `}</style>
            </div>
        </RequireAuth>
    );
}
