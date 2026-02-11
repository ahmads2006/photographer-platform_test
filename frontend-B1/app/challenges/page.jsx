'use client';

import { useEffect, useState } from 'react';
import api from '@/src/lib/api';
import RequireAuth from '@/components/RequireAuth';
import Link from 'next/link';
import { Trophy, Clock, Users, ArrowRight, Flame } from 'lucide-react';

export default function ChallengesPage() {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, active, completed

    useEffect(() => {
        api.get('/challenges')
            .then(res => setChallenges(res.data.challenges || []))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const filteredChallenges = challenges.filter(c => {
        if (filter === 'active') return c.status === 'active';
        if (filter === 'completed') return c.status === 'completed';
        return true;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return '#48bb78';
            case 'completed': return '#a0aec0';
            default: return '#667eea';
        }
    };

    return (
        <RequireAuth>
            <div className="challenges-container">
                <div className="challenges-header">
                    <div className="header-content">
                        <h1 className="title">
                            <Trophy size={32} />
                            Photo Challenges
                        </h1>
                        <p className="subtitle">Compete with photographers and showcase your skills</p>
                    </div>

                    <div className="filter-tabs">
                        <button
                            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All
                        </button>
                        <button
                            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
                            onClick={() => setFilter('active')}
                        >
                            <Flame size={16} />
                            Active
                        </button>
                        <button
                            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                            onClick={() => setFilter('completed')}
                        >
                            Completed
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-grid">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="skeleton-card"></div>
                        ))}
                    </div>
                ) : (
                    <div className="challenges-grid">
                        {filteredChallenges.length === 0 ? (
                            <div className="empty-state">
                                <Trophy size={64} />
                                <h3>No {filter !== 'all' ? filter : ''} challenges found</h3>
                                <p>Check back soon for new photography challenges!</p>
                            </div>
                        ) : (
                            filteredChallenges.map((c, index) => (
                                <div
                                    key={c.id}
                                    className="challenge-card"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="card-header">
                                        <span
                                            className="status-badge"
                                            style={{ background: getStatusColor(c.status) }}
                                        >
                                            {c.status}
                                        </span>
                                        <Trophy size={20} style={{ color: getStatusColor(c.status) }} />
                                    </div>

                                    <h2 className="challenge-title">{c.title}</h2>
                                    <p className="challenge-description">{c.description}</p>

                                    <div className="challenge-meta">
                                        <div className="meta-item">
                                            <Users size={16} />
                                            <span>{c.participants?.length || 0} participants</span>
                                        </div>
                                        <div className="meta-item">
                                            <Clock size={16} />
                                            <span>{new Date(c.endDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <Link href={`/challenges/${c.id}`} className="view-btn">
                                        View Challenge
                                        <ArrowRight size={18} />
                                    </Link>
                                </div>
                            ))
                        )}
                    </div>
                )}

                <style jsx>{`
          .challenges-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
          }

          .challenges-header {
            margin-bottom: 2rem;
          }

          .header-content {
            margin-bottom: 1.5rem;
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
            font-size: 1rem;
            margin: 0;
          }

          .filter-tabs {
            display: flex;
            gap: 0.5rem;
            background: white;
            padding: 0.5rem;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            width: fit-content;
          }

          .filter-btn {
            padding: 0.625rem 1.25rem;
            border: none;
            background: transparent;
            color: #718096;
            font-weight: 600;
            font-size: 0.875rem;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .filter-btn:hover {
            background: #edf2f7;
            color: #4a5568;
          }

          .filter-btn.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }

          .challenges-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 1.5rem;
          }

          .challenge-card {
            background: white;
            border-radius: 16px;
            padding: 1.5rem;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
            transition: all 0.3s;
            animation: fadeInUp 0.4s ease forwards;
            opacity: 0;
            display: flex;
            flex-direction: column;
          }

          .challenge-card:hover {
            transform: translateY(-4px);
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

          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
          }

          .status-badge {
            padding: 0.375rem 0.875rem;
            border-radius: 20px;
            color: white;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .challenge-title {
            font-size: 1.375rem;
            font-weight: 600;
            color: #2d3748;
            margin: 0 0 0.75rem 0;
          }

          .challenge-description {
            color: #718096;
            line-height: 1.6;
            margin: 0 0 1.5rem 0;
            flex: 1;
          }

          .challenge-meta {
            display: flex;
            gap: 1.5rem;
            padding: 1rem 0;
            border-top: 1px solid #edf2f7;
            border-bottom: 1px solid #edf2f7;
            margin-bottom: 1rem;
          }

          .meta-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #a0aec0;
            font-size: 0.875rem;
          }

          .meta-item span {
            color: #4a5568;
            font-weight: 500;
          }

          .view-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.875rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 10px;
            font-weight: 600;
            transition: all 0.2s;
          }

          .view-btn:hover {
            transform: scale(1.02);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          }

          .empty-state {
            grid-column: 1 / -1;
            background: white;
            border-radius: 16px;
            padding: 4rem 2rem;
            text-align: center;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
            color: #a0aec0;
          }

          .empty-state h3 {
            margin: 1rem 0 0.5rem 0;
            color: #4a5568;
            font-size: 1.5rem;
          }

          .empty-state p {
            margin: 0;
            color: #718096;
          }

          .loading-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 1.5rem;
          }

          .skeleton-card {
            height: 280px;
            background: linear-gradient(90deg, #edf2f7 25%, #e2e8f0 50%, #edf2f7 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 16px;
          }

          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }

          @media (max-width: 768px) {
            .challenges-container {
              padding: 1rem;
            }

            .title {
              font-size: 1.75rem;
            }

            .challenges-grid,
            .loading-grid {
              grid-template-columns: 1fr;
            }

            .filter-tabs {
              width: 100%;
            }

            .filter-btn {
              flex: 1;
              justify-content: center;
            }
          }
        `}</style>
            </div>
        </RequireAuth>
    );
}
