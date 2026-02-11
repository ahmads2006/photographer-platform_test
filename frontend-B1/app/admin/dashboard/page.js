'use client';

import { useEffect, useState } from 'react';
import api from '@/src/lib/api';
import RequireAuth from '@/components/RequireAuth';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';

export default function AdminDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('users');

    useEffect(() => {
        if (user && !['admin', 'super_admin'].includes(user.role)) {
            router.push('/');
            return;
        }
        fetchData();
        fetchReports();
    }, [user, page]);

    const fetchData = async () => {
        try {
            const [statsRes, usersRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get(`/admin/users?page=${page}&search=${search}`)
            ]);
            setStats(statsRes.data.stats);
            setUsers(usersRes.data.users);
            setTotalPages(usersRes.data.totalPages);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchReports = async () => {
        try {
            const res = await api.get('/admin/reports');
            setReports(res.data.reports);
        } catch (err) {
            console.error(err);
        }
    }

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchData();
    }

    const handleAction = async (action, id, type) => {
        if (!confirm(`Are you sure you want to ${action}?`)) return;
        try {
            if (action === 'ban') await api.post(`/admin/ban/${id}`);
            if (action === 'unban') await api.post(`/admin/unban/${id}`);

            if (action === 'dismiss') {
                await api.post(`/admin/reports/${id}/dismiss`);
                fetchReports();
            }
            if (action === 'delete_content') {
                await api.delete(`/admin/photos/${id}`); // Assuming photo for now
                fetchReports();
            }

            fetchData();
        } catch (err) {
            alert('Action failed: ' + (err.response?.data?.message || err.message));
        }
    };

    if (!user || !['admin', 'super_admin'].includes(user.role)) return null;

    return (
        <RequireAuth>
            <section className="panel">
                <h1>🛡️ Admin Dashboard</h1>

                {stats && (
                    <div className="stats-row" style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
                        <div><strong>Users:</strong> {stats.usersCount}</div>
                        <div><strong>Photos:</strong> {stats.photosCount}</div>
                        <div><strong>Banned:</strong> {stats.bannedCount}</div>
                        <div><strong>Reports:</strong> {stats.reportsCount}</div>
                    </div>
                )}

                <div style={{ marginBottom: '1rem', borderBottom: '1px solid #ddd' }}>
                    <button
                        onClick={() => setActiveTab('users')}
                        style={{ padding: '0.5rem 1rem', background: activeTab === 'users' ? '#eee' : 'transparent', border: 'none', cursor: 'pointer' }}
                    >
                        Users
                    </button>
                    <button
                        onClick={() => setActiveTab('reports')}
                        style={{ padding: '0.5rem 1rem', background: activeTab === 'reports' ? '#eee' : 'transparent', border: 'none', cursor: 'pointer' }}
                    >
                        Reported Content ({reports.length})
                    </button>
                </div>

                {activeTab === 'users' && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2>User Management</h2>
                            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
                                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." />
                                <button type="submit">Search</button>
                            </form>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                                        <th>User</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '0.5rem' }}>
                                                {u.name} <br /> <small>{u.email}</small>
                                            </td>
                                            <td>{u.role}</td>
                                            <td>
                                                {u.isBanned ? <span style={{ color: 'red' }}>BANNED</span> : 'Active'}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    {u.role === 'user' && (
                                                        <>
                                                            {!u.isBanned ? (
                                                                <button onClick={() => handleAction('ban', u.id)} style={{ fontSize: '0.8rem', background: 'red' }}>Ban</button>
                                                            ) : (
                                                                <button onClick={() => handleAction('unban', u.id)} style={{ fontSize: '0.8rem', background: 'green' }}>Unban</button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                            <span>Page {page} of {totalPages}</span>
                            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
                        </div>
                    </>
                )}

                {activeTab === 'reports' && (
                    <>
                        <h2>Pending Reports</h2>
                        {reports.length === 0 ? <p>No pending reports.</p> : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                                        <th>Target</th>
                                        <th>Type</th>
                                        <th>Reason</th>
                                        <th>Details</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map(r => (
                                        <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '0.5rem' }}>ID: {r.targetId}</td>
                                            <td>{r.targetType}</td>
                                            <td>{r.reason}</td>
                                            <td>{r.description}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button onClick={() => handleAction('dismiss', r.id)} style={{ fontSize: '0.8rem', background: 'gray' }}>Dismiss</button>
                                                    {r.targetType === 'photo' && (
                                                        <button onClick={() => handleAction('delete_content', r.targetId)} style={{ fontSize: '0.8rem', background: 'red' }}>Delete Content</button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </>
                )}
            </section>
        </RequireAuth>
    );
}
