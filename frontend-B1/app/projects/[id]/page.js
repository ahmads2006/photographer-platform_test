'use client';

import { useEffect, useState } from 'react';
import api from '@/src/lib/api';
import RequireAuth from '@/components/RequireAuth';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext'; // Import useAuth to access current user ID

export default function ProjectDetails({ params }) {
    const { id } = params;
    const { user } = useAuth(); // Get current user
    const router = useRouter();
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const [inviteMode, setInviteMode] = useState(false);
    const [users, setUsers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);

    useEffect(() => {
        if (id) fetchGroup();
    }, [id]);

    useEffect(() => {
        if (group && user) {
            setIsOwner(parseInt(group.ownerId) === parseInt(user.id));
        }
    }, [group, user]);

    const fetchGroup = async () => {
        try {
            const res = await api.get(`/groups/${id}`);
            setGroup(res.data.group);
        } catch (err) {
            console.error(err);
            if (err.response?.status === 404 || err.response?.status === 403) {
                router.push('/projects');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this project?')) return;
        try {
            await api.delete(`/groups/${id}`);
            router.push('/projects');
        } catch (err) {
            alert('Failed to delete project.');
        }
    };

    const handleUpdateMembers = async () => {
        // Logic to add members would go here. 
        // Currently the updateGroup endpoint replaces all members, so we need to be careful.
        // For simplicity, let's just implement Delete Project for now as Owner action.
        alert("Member management update coming soon!");
    };

    if (loading) return <p>Loading project...</p>;
    if (!group) return <p>Project not found.</p>;

    return (
        <RequireAuth>
            <section className="panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1>📂 {group.name}</h1>
                        <p className="text-muted">Owner: {group.owner?.name}</p>
                    </div>
                    {isOwner && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={handleDelete} style={{ background: 'red' }}>Delete Project</button>
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '2rem' }}>
                    <h3>👥 Members ({group.members?.length})</h3>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                        {group.members?.map(m => (
                            <div key={m.id} style={{ textAlign: 'center' }}>
                                {m.avatar && <img src={m.avatar} style={{ width: 40, height: 40, borderRadius: '50%' }} />}
                                <div><small>{m.name}</small></div>
                            </div>
                        ))}
                    </div>
                </div>

                <hr />

                <div style={{ marginTop: '2rem' }}>
                    <h3>📸 Project Albums</h3>
                    {group.albums?.length === 0 ? (
                        <p>No albums shared in this project yet.</p>
                    ) : (
                        <div className="grid-gallery">
                            {group.albums?.map(album => (
                                <div key={album.id} className="card">
                                    <h4>{album.name}</h4>
                                    {/* Link to album view */}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </RequireAuth>
    );
}
