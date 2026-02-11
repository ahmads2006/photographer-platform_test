'use client';

import { useState, useEffect } from 'react';
import api from '@/src/lib/api';
import RequireAuth from '@/components/RequireAuth';
import { useRouter } from 'next/navigation';

export default function CreateProjectPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        // Fetch users to invite
        api.get('/users').then(res => setUsers(res.data.users)).catch(console.error);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/groups', {
                name,
                members: selectedMembers
            });
            router.push('/projects');
        } catch (err) {
            alert('Failed to create project: ' + (err.response?.data?.message || err.message));
        }
    };

    const toggleMember = (id) => {
        if (selectedMembers.includes(id)) {
            setSelectedMembers(prev => prev.filter(m => m !== id));
        } else {
            setSelectedMembers(prev => [...prev, id]);
        }
    };

    const filteredUsers = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <RequireAuth>
            <section className="panel narrow">
                <h1>✨ Create New Project</h1>
                <form onSubmit={handleSubmit} className="stack-form">
                    <label>Project Name</label>
                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Summer Photoshoot 2024"
                        required
                    />

                    <label>Invite Members</label>
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search users..."
                        style={{ marginBottom: '1rem' }}
                    />

                    <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', padding: '0.5rem', borderRadius: '4px' }}>
                        {filteredUsers.map(u => (
                            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedMembers.includes(u.id)}
                                    onChange={() => toggleMember(u.id)}
                                />
                                {u.avatar && <img src={u.avatar} style={{ width: 20, height: 20, borderRadius: '50%' }} />}
                                <span>{u.name}</span>
                            </div>
                        ))}
                    </div>
                    <p><small>{selectedMembers.length} members selected</small></p>

                    <button type="submit" disabled={!name}>Create Project</button>
                </form>
            </section>
        </RequireAuth>
    );
}
