'use client';

import { useEffect, useState } from 'react';
import api from '@/src/lib/api';
import RequireAuth from '@/components/RequireAuth';
import { Bell, Check, Trash2, Filter } from 'lucide-react';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = () => {
        api.get('/notifications')
            .then(res => setNotifications(res.data.notifications || []))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    const markRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    const markAllRead = async () => {
        try {
            await Promise.all(
                notifications.filter(n => !n.isRead).map(n => api.patch(`/notifications/${n.id}/read`))
            );
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error(err);
        }
    };

    const filteredNotifications = notifications.filter(n =>
        filter === 'unread' ? !n.isRead : true
    );

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <RequireAuth>
            <div className="notifications-container">
                <div className="notifications-header">
                    <div className="header-content">
                        <h1 className="title">
                            <Bell size={28} />
                            Notifications
                            {unreadCount > 0 && (
                                <span className="unread-badge">{unreadCount}</span>
                            )}
                        </h1>
                        <p className="subtitle">Stay up to date with your activity</p>
                    </div>

                    <div className="header-actions">
                        <div className="filter-buttons">
                            <button
                                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                                onClick={() => setFilter('all')}
                            >
                                All
                            </button>
                            <button
                                className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
                                onClick={() => setFilter('unread')}
                            >
                                Unread ({unreadCount})
                            </button>
                        </div>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead} className="mark-all-btn">
                                <Check size={18} />
                                Mark all as read
                            </button>
                        )}
                    </div>
                </div>

                <div className="notifications-list">
                    {loading ? (
                        [...Array(5)].map((_, i) => (
                            <div key={i} className="skeleton-notification"></div>
                        ))
                    ) : filteredNotifications.length === 0 ? (
                        <div className="empty-state">
                            <Bell size={64} />
                            <h3>No {filter === 'unread' ? 'unread ' : ''}notifications</h3>
                            <p>You're all caught up!</p>
                        </div>
                    ) : (
                        filteredNotifications.map((n, index) => (
                            <div
                                key={n.id}
                                className={`notification-item ${!n.isRead ? 'unread' : ''}`}
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div className="notification-icon">
                                    <Bell size={20} />
                                </div>
                                <div className="notification-content">
                                    <p className="notification-message">{n.message}</p>
                                    <span className="notification-time">
                                        {new Date(n.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <div className="notification-actions">
                                    {!n.isRead && (
                                        <button
                                            onClick={() => markRead(n.id)}
                                            className="action-btn mark-read"
                                            title="Mark as read"
                                        >
                                            <Check size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <style jsx>{`
          .notifications-container {
            max-width: 900px;
            margin: 0 auto;
            padding: 2rem;
          }

          .notifications-header {
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

          .unread-badge {
            background: #ed8936;
            color: white;
            font-size: 0.875rem;
            padding: 0.25rem 0.625rem;
            border-radius: 12px;
            font-weight: 600;
          }

          .subtitle {
            color: #718096;
            font-size: 1rem;
            margin: 0;
          }

          .header-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 1rem;
          }

          .filter-buttons {
            display: flex;
            gap: 0.5rem;
            background: white;
            padding: 0.375rem;
            border-radius: 10px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          }

          .filter-btn {
            padding: 0.625rem 1.125rem;
            border: none;
            background: transparent;
            color: #718096;
            font-weight: 600;
            font-size: 0.875rem;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
          }

          .filter-btn:hover {
            background: #edf2f7;
            color: #4a5568;
          }

          .filter-btn.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }

          .mark-all-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.25rem;
            background: white;
            border: 2px solid #667eea;
            color: #667eea;
            border-radius: 10px;
            font-weight: 600;
            font-size: 0.875rem;
            cursor: pointer;
            transition: all 0.2s;
          }

          .mark-all-btn:hover {
            background: #667eea;
            color: white;
          }

          .notifications-list {
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
          }

          .notification-item {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            padding: 1.25rem;
            border-bottom: 1px solid #edf2f7;
            transition: all 0.3s;
            animation: slideIn 0.3s ease forwards;
            opacity: 0;
          }

          .notification-item:last-child {
            border-bottom: none;
          }

          .notification-item.unread {
            background: linear-gradient(90deg, #eef2ff 0%, transparent 100%);
          }

          .notification-item:hover {
            background: #f7fafc;
          }

          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          .notification-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .notification-item.unread .notification-icon {
            box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
          }

          .notification-content {
            flex: 1;
            min-width: 0;
          }

          .notification-message {
            margin: 0 0 0.375rem 0;
            color: #2d3748;
            line-height: 1.6;
          }

          .notification-time {
            font-size: 0.75rem;
            color: #a0aec0;
          }

          .notification-actions {
            display: flex;
            gap: 0.5rem;
          }

          .action-btn {
            width: 36px;
            height: 36px;
            border-radius: 8px;
            border: none;
            background: #edf2f7;
            color: #4a5568;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
          }

          .action-btn:hover {
            background: #e2e8f0;
          }

          .action-btn.mark-read {
            background: #d4edda;
            color: #155724;
          }

          .action-btn.mark-read:hover {
            background: #c3e6cb;
          }

          .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 4rem 2rem;
            color: #a0aec0;
            text-align: center;
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

          .skeleton-notification {
            height: 80px;
            background: linear-gradient(90deg, #edf2f7 25%, #e2e8f0 50%, #edf2f7 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-bottom: 1px solid #edf2f7;
          }

          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }

          @media (max-width: 768px) {
            .notifications-container {
              padding: 1rem;
            }

            .title {
              font-size: 1.75rem;
            }

            .header-actions {
              flex-direction: column;
              align-items: stretch;
            }

            .filter-buttons,
            .mark-all-btn {
              width: 100%;
            }

            .mark-all-btn {
              justify-content: center;
            }

            .notification-item {
              gap: 0.75rem;
              padding: 1rem;
            }

            .notification-icon {
              width: 36px;
              height: 36px;
            }
          }
        `}</style>
            </div>
        </RequireAuth>
    );
}
